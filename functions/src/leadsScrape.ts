import * as admin from "firebase-admin";
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

/* ===========================
   Apify Google Places scrape → dedupe → n8n
=========================== */

const APIFY_TOKEN = defineSecret("APIFY_TOKEN");
const APIFY_WEBHOOK_SECRET = defineSecret("APIFY_WEBHOOK_SECRET");
const N8N_DEDUPE_WEBHOOK = defineSecret("N8N_DEDUPE_WEBHOOK");

// Confirm this matches the actor's slug in the Apify console (Actor > API tab).
const APIFY_ACTOR_ID = "compass~crawler-google-places";
const MAX_QUANTITY = 200;
const DEFAULT_QUANTITY = 50;

// Deployed function URL used to build the Apify webhook callback.
const WEBHOOK_BASE_URL =
  "https://us-central1-thelaundryhubsf.cloudfunctions.net/onApifyRunComplete";

interface StartScrapeRequest {
  searchQueries?: string[];
  quantity?: number;
}

const MAX_QUERIES_PER_RUN = 20;

export const startLeadsScrape = onCall<StartScrapeRequest>(
  { secrets: [APIFY_TOKEN, APIFY_WEBHOOK_SECRET] },
  async (request) => {
    if (request.auth?.token?.admin !== true) {
      throw new HttpsError("permission-denied", "Admins only.");
    }

    const searchQueries = (request.data.searchQueries ?? [])
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    if (searchQueries.length === 0) {
      throw new HttpsError("invalid-argument", "At least one search is required.");
    }
    if (searchQueries.length > MAX_QUERIES_PER_RUN) {
      throw new HttpsError(
        "invalid-argument",
        `Too many searches — max ${MAX_QUERIES_PER_RUN} per run.`
      );
    }
    if (searchQueries.some((q) => q.length > 200)) {
      throw new HttpsError("invalid-argument", "Each search must be 200 chars or fewer.");
    }

    const rawQuantity = Number(request.data.quantity);
    const quantity = Number.isFinite(rawQuantity)
      ? Math.min(Math.max(Math.trunc(rawQuantity), 1), MAX_QUANTITY)
      : DEFAULT_QUANTITY;

    const webhookUrl = `${WEBHOOK_BASE_URL}?key=${encodeURIComponent(
      APIFY_WEBHOOK_SECRET.value()
    )}`;

    const webhooksPayload = Buffer.from(
      JSON.stringify([
        {
          eventTypes: [
            "ACTOR.RUN.SUCCEEDED",
            "ACTOR.RUN.FAILED",
            "ACTOR.RUN.TIMED_OUT",
            "ACTOR.RUN.ABORTED",
          ],
          requestUrl: webhookUrl,
        },
      ])
    ).toString("base64");

    const res = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs?webhooks=${webhooksPayload}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${APIFY_TOKEN.value()}`,
        },
        body: JSON.stringify({
          searchStringsArray: searchQueries,
          maxCrawledPlacesPerSearch: quantity,
          language: "en",
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Apify run-start failed", { status: res.status, text });
      throw new HttpsError("internal", "Failed to start Apify run.");
    }

    const body = (await res.json()) as { data: { id: string } };
    const runId = body.data.id;

    await admin.firestore().collection("scrapeRuns").doc(runId).set({
      runId,
      searchQueries,
      quantity,
      status: "started",
      startedBy: request.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { runId };
  }
);

interface LeadRow {
  title: string;
  categoryName: string;
  phone: string;
  phoneUnformatted: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  website: string;
  totalScore: string;
  reviewsCount: string;
  placeId: string;
  url: string;
}

function toLeadRow(item: Record<string, unknown>): LeadRow {
  const asString = (v: unknown): string => (v == null ? "" : String(v));
  return {
    title: asString(item.title),
    categoryName: asString(item.categoryName),
    phone: asString(item.phone),
    phoneUnformatted: asString(item.phoneUnformatted),
    address: asString(item.address),
    city: asString(item.city),
    state: asString(item.state),
    postalCode: asString(item.postalCode),
    website: asString(item.website),
    totalScore: asString(item.totalScore),
    reviewsCount: asString(item.reviewsCount),
    placeId: asString(item.placeId),
    url: asString(item.url),
  };
}

export const onApifyRunComplete = onRequest(
  { secrets: [APIFY_TOKEN, APIFY_WEBHOOK_SECRET, N8N_DEDUPE_WEBHOOK] },
  async (req, res) => {
    if (req.query.key !== APIFY_WEBHOOK_SECRET.value()) {
      res.status(401).send("unauthorized");
      return;
    }

    const eventType = req.body?.eventType as string | undefined;
    const runId = req.body?.resource?.id as string | undefined;
    const datasetId = req.body?.resource?.defaultDatasetId as
      | string
      | undefined;

    if (!runId) {
      res.status(400).send("missing run id");
      return;
    }

    const runDocRef = admin.firestore().collection("scrapeRuns").doc(runId);

    if (eventType !== "ACTOR.RUN.SUCCEEDED" || !datasetId) {
      await runDocRef.set(
        {
          status: "failed",
          eventType: eventType ?? "unknown",
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      // Ack — nothing to retry, the run just didn't succeed.
      res.status(200).send("ok");
      return;
    }

    const itemsRes = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?clean=true`,
      { headers: { authorization: `Bearer ${APIFY_TOKEN.value()}` } }
    );
    if (!itemsRes.ok) {
      console.error("Failed to fetch Apify dataset items", {
        status: itemsRes.status,
      });
      // 5xx so Apify retries the webhook delivery.
      res.status(502).send("dataset fetch failed");
      return;
    }

    const items = (await itemsRes.json()) as Record<string, unknown>[];
    const rows = items.map(toLeadRow);

    // n8n owns deduping (both within the batch and against the master list) —
    // forward the raw scraped rows as-is.
    const n8nRes = await fetch(N8N_DEDUPE_WEBHOOK.value(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fileName: `apify-run-${runId}`, leads: rows }),
    });

    await runDocRef.set(
      {
        status: n8nRes.ok ? "completed" : "failed",
        totalScraped: rows.length,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    if (!n8nRes.ok && n8nRes.status >= 500) {
      // Let Apify retry the webhook delivery.
      res.status(502).send("n8n forward failed");
      return;
    }

    res.status(200).send("ok");
  }
);
