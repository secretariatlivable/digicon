// Find the approval link returned by PayPal.
const approvalLink = Array.isArray(subscription.links)
  ? subscription.links.find(
      (link: { rel?: string; href?: string }) =>
        link.rel === "approve" && typeof link.href === "string",
    )?.href
  : undefined;

// Reject a successful PayPal response that does not contain an approval URL.
if (!approvalLink) {
  return json(
    { error: "PayPal did not return an approval URL." },
    502,
  );
}

// Do not grant paid entitlements here.
// The verified PayPal webhook remains the authoritative billing writer.
return json({
  subscriptionId: subscription.id,
  status: subscription.status,
  approvalUrl: approvalLink,
});
