/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import { onRequest } from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import twilio from "twilio";

admin.initializeApp();

// ✅ Secure secrets
const TWILIO_SID = defineSecret("TWILIO_SID");
const TWILIO_TOKEN = defineSecret("TWILIO_TOKEN");
const TWILIO_PHONE = defineSecret("TWILIO_PHONE");

// ✅ Cloud Function
export const sendSmsOnOrder = onDocumentCreated(
  {
    document: "orders/{orderId}",
    secrets: [TWILIO_SID, TWILIO_TOKEN, TWILIO_PHONE],
  },
  async (event) => {
    const order = event.data?.data();
    if (!order || !order.phone) return;

    const client = twilio(TWILIO_SID.value(), TWILIO_TOKEN.value());

    const customerMessage = `🌀 Hi ${order.firstName}, your order #${order.orderId} was received by The Laundry Hub SF! We’ll text you when it’s ready for pickup.`;

    const ownerMessage = `📥 New Order Received:
- Name: ${order.firstName} ${order.lastName}
- Order ID: ${order.orderId}
- Phone: ${order.phone}
- Service Type: ${order.serviceType}
- Dropoff Date: ${new Date(order.dropOffDate)}
- specialRequests: ${order.specialRequests || "N/A"}`;

    const customerSend = client.messages.create({
      body: customerMessage,
      to: order.phone,
      from: TWILIO_PHONE.value(),
    });

    const ownerPhones = ["+15109253180"];
    const ownerSends = ownerPhones.map((ownerPhone) =>
      client.messages.create({
        body: ownerMessage,
        to: ownerPhone,
        from: TWILIO_PHONE.value(),
      })
    );

    await Promise.all([customerSend, ...ownerSends]);
  }
);
