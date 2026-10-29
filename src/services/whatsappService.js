import { addDoc, collection } from 'firebase/firestore';
import { fireDB } from '../firebase/FirebaseConfig';

/**
 * Universal Meta WhatsApp Deep Link Generator (wa.me)
 * Generates user-initiated WhatsApp deep links across desktop browsers and mobile devices.
 */
export function getWhatsAppDispatchUrl(phone, text) {
  const clean = phone ? phone.replace(/[^0-9]/g, '') : '919746998785';
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${clean}?text=${encoded}`;
}

/**
 * Secure WhatsApp Notification Service
 * Logs notification job status in Firestore and provides user-initiated wa.me deep link fallback.
 */
export async function sendAutomatedWhatsAppNotification(recipientPhone, messagePayload, options = {}) {
  const cleanPhone = recipientPhone ? recipientPhone.replace(/[^0-9]/g, '') : '919746998785';
  const waUrl = getWhatsAppDispatchUrl(cleanPhone, messagePayload);

  // 1. Record truthful notification job lifecycle log in Firestore
  try {
    await addDoc(collection(fireDB, 'whatsapp_jobs'), {
      recipientPhone: cleanPhone,
      message: messagePayload,
      type: options.type || "ORDER_NOTIFICATION",
      customerName: options.customerName || "Customer",
      status: 'USER_INITIATED_WA_LINK',
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Firestore whatsapp_job log notice:", err.message);
  }

  // 2. Open pre-allocated user-initiated wa.me deep link
  if (options.autoOpenWindow !== false) {
    try {
      const popup = window.open(waUrl, '_blank');
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        if (options.directRedirect === true) {
          window.location.href = waUrl;
        }
      }
      return { success: true, method: "WA_API_LINK" };
    } catch (e) {
      console.warn("Direct WA trigger notice:", e);
    }
  }

  return { success: true, method: "FIRESTORE_QUEUE" };
}
