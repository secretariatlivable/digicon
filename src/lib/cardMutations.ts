import { supabase, type BusinessCard, type DigiConCapability } from '@/lib/supabase';

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
  | { ok: true; card: BusinessCard }
  | {
      ok: false;
      code:
        | 'authentication_required'
        | 'capability_denied'
        | 'mutation_failed';
      message: string;
    };

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

  return message;
}

async function requireServerCapability(
  capability: DigiConCapability,
  resourceId?: string,
): Promise<CardMutationResult | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      code: 'authentication_required',
      message: 'Your session has expired. Please sign in again.',
    };
  }

  const { data, error } = await supabase.rpc('digicon_check_capability', {
    p_capability: capability,
    p_resource_id: resourceId ?? null,
  });

  if (error) {
    console.error('[DigiCon] Server capability check failed:', error);
    return {
      ok: false,
      code: 'mutation_failed',
      message: 'We could not verify your DigiCon permissions. Please try again.',
    };
  }

  const verdict = Array.isArray(data) ? data[0] : data;

  if (!verdict?.allowed) {
    return {
      ok: false,
      code: 'capability_denied',
      message:
        verdict?.code === 'paid_plan_required'
          ? 'This capability requires an active paid DigiCon plan.'
          : 'This action is not available under your current DigiCon entitlement.',
    };
  }

  return null;
}

export async function createBusinessCard(
  input: CardMutationInput,
): Promise<CardMutationResult> {
  const denied = await requireServerCapability('card.create');
  if (denied) return denied;

  const { data, error } = await supabase
    .rpc('create_business_card', {
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
    })
    .single();

  if (error || !data) {
    const message = normalizeMutationError(
      error?.message || 'Unable to create the DigiCon card.',
    );
    console.error('[DigiCon] create_business_card failed:', error);
    return { ok: false, code: 'mutation_failed', message };
  }

  return { ok: true, card: data as BusinessCard };
}

export async function updateBusinessCard(
  cardId: string,
  input: CardMutationInput,
): Promise<CardMutationResult> {
  const denied = await requireServerCapability('card.edit', cardId);
  if (denied) return denied;

  const { data, error } = await supabase
    .rpc('update_business_card', {
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
    })
    .single();

  if (error || !data) {
    const message = normalizeMutationError(
      error?.message || 'Unable to update the DigiCon card.',
    );
    console.error('[DigiCon] update_business_card failed:', error);
    return { ok: false, code: 'mutation_failed', message };
  }

  return { ok: true, card: data as BusinessCard };
}
