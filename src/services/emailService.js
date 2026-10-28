import { addDoc, collection } from 'firebase/firestore';
import { fireDB } from '../firebase/FirebaseConfig';

/**
 * Option 2: Automated Email Dispatch Service
 * Sends itemized order notifications directly to lakshmistoresonline@gmail.com via direct FormSubmit HTTP Gateway
 */
export async function sendAutomatedOrderEmail(orderData) {
  const { referenceId, customerName, customerEmail, phone, cartItems, cartSubtotal, address, pinCode } = orderData || {};

  const emailSubject = `🛍️ NEW SAREE ORDER SUBMISSION — Ref: ${referenceId} (${customerName})`;
  const itemsListText = (cartItems || []).map(i => `• ${i.title} (ID: ${i.id}) - ₹${i.price || 0}`).join('\n');

  const emailBody = `
===============================================
🛍️ NEW VASTRAA ONLINE SAREE ORDER SUBMISSION
===============================================

ORDER REFERENCE: ${referenceId}
DATE & TIME: ${new Date().toLocaleString()}

CUSTOMER DETAILS:
• Name: ${customerName}
• Phone / WhatsApp: ${phone}
• Email: ${customerEmail || 'Not provided'}
• Delivery Address: ${address} (Pincode: ${pinCode})

ITEMIZED SAREE ORDER BREAKDOWN:
${itemsListText}

ESTIMATED ORDER SUBTOTAL: ₹${cartSubtotal}
STATUS: Pending Review & Quotation
===============================================
`;

  // 1. Log to Firestore email_jobs collection for audit
  try {
    await addDoc(collection(fireDB, 'email_jobs'), {
      recipientEmail: "lakshmistoresonline@gmail.com",
      subject: emailSubject,
      body: emailBody,
      referenceId,
      customerName,
      phone,
      status: "DISPATCHED_AUTOMATED",
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Firestore email_job log notice:", err.message);
  }

  // 2. Direct HTTP POST Dispatch via FormSubmit Endpoint (Delivers directly to lakshmistoresonline@gmail.com)
  try {
    const response = await fetch("https://formsubmit.co/ajax/lakshmistoresonline@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        _subject: emailSubject,
        order_reference: referenceId,
        customer_name: customerName,
        customer_phone: phone,
        customer_email: customerEmail || 'Not provided',
        delivery_address: `${address} (Pincode: ${pinCode})`,
        order_subtotal: `₹${cartSubtotal}`,
        itemized_items: itemsListText,
        _template: "table"
      })
    });
    if (response.ok) {
      console.log("✓ Automated Email delivered directly to lakshmistoresonline@gmail.com");
    }
  } catch (e) {
    console.warn("FormSubmit HTTP POST notice:", e.message);
  }

  return { success: true };
}
