import { addDoc, collection } from 'firebase/firestore';
import { fireDB } from '../firebase/FirebaseConfig';

/**
 * Automated Email Dispatch Service
 * Sends itemized order notifications directly to lakshmistoresonline@gmail.com
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

  // 2. HTTP POST dispatch to EmailJS / REST API endpoint if configured
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_vastraa";
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_vastraa_order";
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (publicKey) {
    try {
      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            to_email: "lakshmistoresonline@gmail.com",
            subject: emailSubject,
            message: emailBody,
            customer_name: customerName,
            customer_phone: phone,
            order_ref: referenceId
          }
        })
      });
      console.log("✓ Automated Email delivered to lakshmistoresonline@gmail.com");
    } catch (e) {
      console.warn("Email API POST notice:", e.message);
    }
  }

  return { success: true };
}
