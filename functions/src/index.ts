import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import twilio from "twilio";

admin.initializeApp();

/* ===========================
   Twilio (existing)
=========================== */
const TWILIO_SID = defineSecret("TWILIO_SID");
const TWILIO_TOKEN = defineSecret("TWILIO_TOKEN");
const TWILIO_PHONE = defineSecret("TWILIO_PHONE");

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
- New Customer: ${order.newCustomer ? "Yes" : "No"}
- Order ID: ${order.orderId}
- Phone: ${order.phone}
- Pickup/Drop-off: ${order.deliveryType}
- Service Type: ${order.serviceType}
- Drop-off/ Pick-up Date: ${new Date(order.dropOffDate).toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "2-digit",
        year: "numeric",
      }
    )}
- Time: ${order.timeSlot}
- Address: ${
      order.selectDelivery === "Pickup & Delivery"
        ? `${order.addressLine1} ${order.addressLine2 || ""}, ${order.city}, ${
            order.state
          } ${order.zip}`
        : "N/A"
    }
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

/* ===========================
   Raffle → n8n → Google Sheets
   (new)
=========================== */

interface RaffleDoc {
  name?: string;
  phone?: string;
  email?: string;
  smsConsent?: boolean;
  // client writes serverTimestamp(); at runtime this is a Firestore Timestamp
  createdAt?: admin.firestore.Timestamp | Date;
}

/** Payload we send to n8n */
interface RafflePayload {
  entryId: string;
  name: string;
  phone: string;
  email: string;
  smsConsent: boolean;
  createdAt: string; // ISO-8601
}

// Type guard for Firestore Timestamp (admin SDK)
function isFirestoreTimestamp(v: unknown): v is admin.firestore.Timestamp {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as admin.firestore.Timestamp).toDate === "function"
  );
}

// Build a reliable ISO string from field or snapshot metadata
function toIsoFromFieldOrMeta(
  field: RaffleDoc["createdAt"] | undefined,
  meta: admin.firestore.Timestamp | undefined
): string {
  if (field && isFirestoreTimestamp(field)) return field.toDate().toISOString();
  if (field instanceof Date) return field.toISOString();
  if (meta) return meta.toDate().toISOString();
  return new Date().toISOString();
}

// --- Secrets -------------------------------------------------------

const N8N_RAFFLE_WEBHOOK = defineSecret("N8N_RAFFLE_WEBHOOK");
const N8N_RAFFLE_SECRET = defineSecret("N8N_RAFFLE_SECRET");

// --- Function ------------------------------------------------------

export const forwardRaffleToN8n = onDocumentCreated(
  {
    document: "raffle/{entryId}",
    secrets: [N8N_RAFFLE_WEBHOOK, N8N_RAFFLE_SECRET],
  },
  async (event): Promise<void> => {
    const snap = event.data; // QueryDocumentSnapshot
    if (!snap) return;

    // Narrow the doc data to our interface without using `any`
    const raw = snap.data() as Partial<RaffleDoc>; // assertion to a *specific* shape (no `any`)

    const entryId = event.params?.entryId ?? "";

    // Reliable createdAt ISO (handles serverTimestamp, Date, or missing)
    const createdAtIso = toIsoFromFieldOrMeta(raw.createdAt, snap.createTime);

    const payload: RafflePayload = {
      entryId,
      name: raw.name ?? "",
      phone: raw.phone ?? "",
      email: raw.email ?? "",
      smsConsent: Boolean(raw.smsConsent),
      createdAt: createdAtIso,
    };

    // Bail early if phone is missing; no need to hit n8n
    if (!payload.phone) {
      console.warn("forwardRaffleToN8n: missing phone; skipping", { entryId });
      return;
    }

    const res = await fetch(N8N_RAFFLE_WEBHOOK.value(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-raffle-key": N8N_RAFFLE_SECRET.value(),
      },
      body: JSON.stringify(payload),
    });

    console.log("res", res);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("n8n webhook error", { status: res.status, text });

      // Retry only for transient server errors
      if (res.status >= 500)
        throw new Error(`n8n webhook failed: ${res.status}`);
      // For 4xx just log and exit (no endless retries)
      return;
    }
  }
);
