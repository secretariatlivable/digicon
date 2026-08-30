import {
  checkServerCapability,
  supabase,
  type BusinessCard,
  type DigiConCapability,
} from '@/lib/supabase';

/**
 * Fields accepted by the trusted card mutation RPCs.
 *
 * IMPORTANT:
 * The property names intentionally map 1:1 to the RPC parameter contract
 * implemented in:
 *
 *   supabase/migrations/20260830020000_trusted_card_mutations.sql
 *
 * The browser must never provide `user_id`. The server derives ownership
 * from auth.uid().
 */
export type CardMutationInput = {
  full_name: string;
  job_title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  bio: string;
  card_color: string;
  accent_color: string;
  design_template: string;
  font_family: string;
  photo_url: string;
};

export type CardMutationResult =
  | {
      ok: true;
      card: BusinessCard;
    }
  | {
      ok: false;
      code:
        | 'authentication_required'
        | 'capability_denied'
        | 'mutation_failed';
      message: string;
    };

/**
 * Convert known database enforcement messages into user-facing copy.
 *
 * The database remains authoritative. These messages are only translated
 * here so that PostgreSQL implementation details do not leak directly into
 * the UI.
 */
function normalizeMutationError(message: string): string {
  if (/two digital business cards/i.test(message)) {
    return 'You have reached the two-card Startup limit. Upgrade to create another DigiCon identity.';
  }

  if (/three digital business cards/i.test(message)) {
    return 'You have reached the three-card Starter limit. Upgrade to Growth for unlimited cards.';
  }

  if (/two edits per card/i.test(message)) {
    return 'This card has reached its two-edit Startup allowance. Upgrade to keep your professional identity current.';
  }

  if (/authentication required/i.test(message)) {
    return 'Please sign in before modifying your DigiCon card.';
  }

  if (/not owned by the current user/i.test(message)) {
    return 'You do not have permission to modify this card.';
  }

  if (/not found or not owned/i.test(message)) {
    return 'The card could not be found or you do not have permission to modify it.';
  }

  return message;
}

/**
 * Performs the server-side capability preflight.
 *
 * This is intentionally NOT the final security boundary.
 *
 * The actual trusted RPC repeats the capability check inside PostgreSQL.
 * That protects DigiCon even if a malicious client completely bypasses
 * this TypeScript module.
 */
async function requireServerCapability(
  capability: DigiConCapability,
  resourceId?: string,
): Promise<CardMutationResult | null> {
  try {
    const result = await checkServerCapability(capability, resourceId);

    if (!result) {
      return {
        ok: false,
        code: 'mutation_failed',
        message:
          'We could not verify your DigiCon permissions. Please try again.',
      };
    }

    if (!result.allowed) {
      if (result.code === 'authentication_required') {
        return {
          ok: false,
          code: 'authentication_required',
          message: 'Please sign in before modifying your DigiCon card.',
        };
      }

      return {
        ok: false,
        code: 'capability_denied',
        message:
          result.code === 'paid_plan_required'
            ? 'This capability requires an active paid DigiCon plan.'
            : 'This action is not available under your current DigiCon entitlement.',
      };
    }

    return null;
  } catch (error) {
    console.error('[DigiCon] Capability preflight failed:', error);

    return {
      ok: false,
      code: 'mutation_failed',
      message:
        'We could not verify your DigiCon permissions. Please try again.',
    };
  }
}

/**
 * Converts a Supabase RPC response into DigiCon's stable mutation contract.
 *
 * The RPC itself remains authoritative. This function only translates its
 * result into a predictable frontend shape.
 */
async function invokeCardRpc(
  functionName: 'create_business_card' | 'update_business_card',
  params: Record<string, unknown>,
): Promise<CardMutationResult> {
  try {
    const { data, error } = await supabase.rpc(functionName, params);

    if (error) {
      console.error(`[DigiCon] ${functionName} failed:`, error);

      /*
       * PostgreSQL 42501 = insufficient_privilege.
       *
       * DigiCon deliberately uses this for server-side capability and
       * ownership denials.
       */
      if (error.code === '42501') {
        return {
          ok: false,
          code: 'capability_denied',
          message: normalizeMutationError(error.message),
        };
      }

      /*
       * PostgreSQL 28000 = invalid authorization specification.
       *
       * Also catch the explicit application-level authentication message
       * because the database RPC raises that message directly.
       */
      if (
        error.code === '28000' ||
        /authentication required/i.test(error.message)
      ) {
        return {
          ok: false,
          code: 'authentication_required',
          message:
            'Please sign in before modifying your DigiCon card.',
        };
      }

      return {
        ok: false,
        code: 'mutation_failed',
        message: normalizeMutationError(
          error.message ||
            `Unable to ${
              functionName === 'create_business_card'
                ? 'create'
                : 'update'
            } the DigiCon card.`,
        ),
      };
    }

    /*
     * Supabase RPCs returning a composite PostgreSQL type normally return
     * an object. This fallback also handles array-shaped responses so the
     * adapter remains tolerant of PostgREST response representation.
     */
    const card = (
      Array.isArray(data) ? data[0] : data
    ) as BusinessCard | null | undefined;

    if (!card) {
      return {
        ok: false,
        code: 'mutation_failed',
        message:
          'The card operation completed without returning the saved card.',
      };
    }

    return {
      ok: true,
      card,
    };
  } catch (error) {
    console.error(`[DigiCon] Unexpected ${functionName} failure:`, error);

    return {
      ok: false,
      code: 'mutation_failed',
      message:
        'Something went wrong while saving your DigiCon card. Please try again.',
    };
  }
}

/**
 * Create a DigiCon business card.
 *
 * SECURITY MODEL:
 * - Client performs a server capability preflight.
 * - RPC derives the authenticated user using auth.uid().
 * - RPC checks the current entitlement again.
 * - Database trigger/RLS remains an additional enforcement layer.
 *
 * No user_id is accepted from the browser.
 */
export async function createBusinessCard(
  input: CardMutationInput,
): Promise<CardMutationResult> {
  const denied = await requireServerCapability('card.create');

  if (denied) {
    return denied;
  }

  return invokeCardRpc('create_business_card', {
    p_full_name: input.full_name.trim(),
    p_job_title: input.job_title.trim(),
    p_company: input.company.trim(),
    p_phone: input.phone.trim(),
    p_email: input.email.trim(),
    p_website: input.website.trim(),
    p_address: input.address.trim(),
    p_bio: input.bio.trim(),
    p_card_color: input.card_color,
    p_accent_color: input.accent_color,
    p_design_template: input.design_template,
    p_font_family: input.font_family,
    p_photo_url: input.photo_url.trim(),
  });
}

/**
 * Update an existing DigiCon business card.
 *
 * SECURITY MODEL:
 * - Client performs a server capability preflight for this card.
 * - RPC derives the authenticated user using auth.uid().
 * - RPC verifies that the card belongs to that user.
 * - RPC checks the current entitlement again.
 * - Database trigger/RLS remains an additional enforcement layer.
 *
 * No user_id is accepted from the browser.
 */
export async function updateBusinessCard(
  cardId: string,
  input: CardMutationInput,
): Promise<CardMutationResult> {
  if (!cardId.trim()) {
    return {
      ok: false,
      code: 'mutation_failed',
      message: 'A valid card ID is required.',
    };
  }

  const denied = await requireServerCapability('card.edit', cardId);

  if (denied) {
    return denied;
  }

  return invokeCardRpc('update_business_card', {
    p_card_id: cardId,
    p_full_name: input.full_name.trim(),
    p_job_title: input.job_title.trim(),
    p_company: input.company.trim(),
    p_phone: input.phone.trim(),
    p_email: input.email.trim(),
    p_website: input.website.trim(),
    p_address: input.address.trim(),
    p_bio: input.bio.trim(),
    p_card_color: input.card_color,
    p_accent_color: input.accent_color,
    p_design_template: input.design_template,
    p_font_family: input.font_family,
    p_photo_url: input.photo_url.trim(),
  });
}
