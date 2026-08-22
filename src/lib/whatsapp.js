/**
 * Build a `wa.me/<digits>` link for the WhatsApp checkout redirect.
 *
 * Rules from the prompt (§5.4):
 *   - Strip every non-digit character from the merchant's `phone`.
 *   - The stored phone MUST include a country code (no `+`, spaces,
 *     or dashes). If a merchant is missing a country code we can't
 *     safely guess one — we still attempt to send the message, but
 *     log a warning so the issue is visible during dev.
 *   - Message format: `"Hi, I'd like to complete my order #<id>:
 *     <lines>. Total: ₦<total>"`
 */
export function buildWhatsAppCheckoutLink({ phone, message }) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length < 10) {
    // Almost certainly missing a country code; we still build the
    // link but flag it. WhatsApp will reject it on the user's end.
    if (typeof console !== "undefined") {
      console.warn(
        "[whatsapp] merchant phone looks too short to include a country code:",
        phone
      );
    }
  }
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${text}`;
}

/**
 * Build the order summary message that pre-fills WhatsApp.
 * `lines` is an array of strings like "2x Blue Shirt".
 */
export function buildOrderMessage({ orderId, lines, totalLabel, merchantName }) {
  const greet = merchantName ? `Hi ${merchantName}, ` : "Hi, ";
  const orderPart = orderId ? `order #${orderId}` : "my order";
  const linePart = lines?.length ? `: ${lines.join(", ")}` : "";
  const totalPart = totalLabel ? `. Total: ${totalLabel}` : "";
  return `${greet}I'd like to complete my ${orderPart}${linePart}${totalPart}`;
}
