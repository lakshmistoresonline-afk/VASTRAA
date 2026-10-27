import { addDoc, collection } from 'firebase/firestore';
import { fireDB } from '../firebase/FirebaseConfig';

/**
 * Dispatch automated WhatsApp notifications
 * Supports direct Meta Cloud API / AiSensy API integration with fail-safe browser URL dispatch
 */
export async function sendAutomatedWhatsAppNotification(recipientPhone, messagePayload, options = {}) {
  const cleanPhone = recipientPhone ? recipientPhone.replace(/[^0-9]/g, '') : '919746998785';

  // 1. Record job document in Firestore whatsapp_jobs
  try {
    await addDoc(collection(fireDB, 'whatsapp_jobs'), {
      recipientPhone: cleanPhone,
      message: messagePayload,
      type: options.type || "AUTOMATED_DISPATCH",
      status: 'DISPATCHED_AUTOMATED',
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Firestore whatsapp_job record notice:", err.message);
  }

  // 2. Direct AiSensy API HTTP POST Dispatch if VITE_AISENSY_API_KEY is configured
  const aiSensyKey = import.meta.env.VITE_AISENSY_API_KEY;
  if (aiSensyKey) {
    try {
      await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: aiSensyKey,
          campaignName: options.campaignName || "vastraa_automated_notifications",
          destination: cleanPhone,
          userName: options.customerName || "Customer",
          templateParams: [messagePayload]
        })
      });
      console.log(`✓ Automated AiSensy WhatsApp dispatched to ${cleanPhone}`);
      return { success: true, method: "AISENSY_API" };
    } catch (apiErr) {
      console.error("AiSensy API dispatch error:", apiErr);
    }
  }

  // 3. Fail-safe Direct WhatsApp Web / App API Dispatch Trigger
  if (options.autoOpenWindow !== false) {
    const encodedText = encodeURIComponent(messagePayload);
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    try {
      window.open(waUrl, '_blank');
      return { success: true, method: "WA_DIRECT_URL" };
    } catch (e) {
      console.warn("Direct WA popup notice:", e);
    }
  }

  return { success: true, method: "FIRESTORE_QUEUE" };
}
