/**
 * AI Service — delegates image validation to the Python garbage_image_tester microservice.
 * Python service must be running at PYTHON_AI_SERVICE_URL (default: http://localhost:8000)
 *
 * Includes retry logic to handle Render free-tier cold starts (502 / sleeping service).
 */

const http = require("http");
const https = require("https");

const AI_SERVICE_URL = (
  process.env.PYTHON_AI_SERVICE_URL || "http://localhost:8000"
).replace(/\/$/, "");

console.log(`[AI] ===== AI Service configured with URL: ${AI_SERVICE_URL} =====`);

const MAX_RETRIES = 5;

/* ---------- helpers ---------- */

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Fire-and-forget GET to wake the service up. */
function wakeUpPing() {
  try {
    const parsed = new URL(AI_SERVICE_URL);
    const lib = parsed.protocol === "https:" ? https : http;
    const req = lib.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: "/",
      method: "GET",
    });
    req.on("error", () => {}); // ignore
    req.end();
  } catch (_) {
    /* ignore */
  }
}

/**
 * Single-shot POST request that returns a parsed JSON body.
 * Throws on network errors, non-2xx, or non-JSON responses.
 */
function postJSONOnce(url, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const parsed = new URL(url);
    const lib = parsed.protocol === "https:" ? https : http;

    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          // Detect HTML / non-JSON responses (e.g. Render 502 page)
          const isHTML =
            data.trimStart().startsWith("<!") ||
            data.trimStart().startsWith("<html");
          if (isHTML || res.statusCode === 502 || res.statusCode === 503) {
            return reject(
              Object.assign(
                new Error(
                  `AI service returned ${res.statusCode} (service may be waking up)`,
                ),
                { retryable: true },
              ),
            );
          }

          try {
            const json = JSON.parse(data);
            if (res.statusCode >= 400) {
              return reject(
                new Error(
                  `AI service error (${res.statusCode}): ${json.error || data}`,
                ),
              );
            }
            resolve(json);
          } catch {
            reject(
              Object.assign(
                new Error(`Failed to parse AI service response: ${data.slice(0, 200)}`),
                { retryable: true },
              ),
            );
          }
        });
      },
    );

    req.setTimeout(30000, () => {
      req.destroy(
        Object.assign(new Error("AI service request timed out"), {
          retryable: true,
        }),
      );
    });

    req.on("error", (err) => {
      err.retryable = true;
      reject(err);
    });
    req.write(payload);
    req.end();
  });
}

/**
 * POST with automatic retries for cold-start / transient failures.
 * Strategy:
 *   1. Fire a wake-up ping and wait for the service health endpoint to respond.
 *   2. Once the service is confirmed alive, send the actual POST.
 *   3. Retry the POST on transient failures with short delays.
 */
async function postJSON(url, body) {
  // ── Phase 1: Wake the service up ──
  console.log("[AI] Phase 1 — Waking up AI service…");
  wakeUpPing();
  // Give the service up to ~90 s to come alive (checked every 10 s)
  const WAKE_CHECK_INTERVAL = 10000; // 10 s
  const WAKE_MAX_CHECKS = 9;         // 9 × 10 s = 90 s max
  let serviceAlive = false;

  for (let i = 1; i <= WAKE_MAX_CHECKS; i++) {
    try {
      await new Promise((resolve, reject) => {
        const parsed = new URL(AI_SERVICE_URL);
        const lib = parsed.protocol === "https:" ? https : http;
        const req = lib.request(
          { hostname: parsed.hostname, port: parsed.port, path: "/health", method: "GET" },
          (res) => {
            let d = "";
            res.on("data", (c) => (d += c));
            res.on("end", () => {
              if (res.statusCode === 200) resolve();
              else reject(new Error(`health ${res.statusCode}`));
            });
          },
        );
        req.setTimeout(8000, () => req.destroy(new Error("health timeout")));
        req.on("error", reject);
        req.end();
      });
      console.log(`[AI] Service alive after check ${i}`);
      serviceAlive = true;
      break;
    } catch {
      console.log(`[AI] Wake check ${i}/${WAKE_MAX_CHECKS} — not ready yet`);
      await sleep(WAKE_CHECK_INTERVAL);
    }
  }

  if (!serviceAlive) {
    console.warn("[AI] Service did not respond to health checks; proceeding anyway…");
  }

  // ── Phase 2: Send the actual request with retries ──
  console.log("[AI] Phase 2 — Sending validation request…");
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await postJSONOnce(url, body);
    } catch (err) {
      lastError = err;
      console.warn(
        `[AI] Attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`,
      );
      if (!err.retryable || attempt === MAX_RETRIES) break;
      const delay = 5000 * attempt; // 5 s, 10 s, 15 s, 20 s
      console.log(`[AI] Retrying in ${delay / 1000}s …`);
      await sleep(delay);
    }
  }
  throw lastError;
}

/* ---------- public API ---------- */

/**
 * Validates a garbage dump image.
 * Returns: { isValid, reasoning, confidence }
 */
const validateDumpImage = async (imageUrl) => {
  try {
    const targetUrl = `${AI_SERVICE_URL}/api/validate/dump`;
    console.log(`[AI] >>>>>> validateDumpImage CALLED <<<<<<`);
    console.log(`[AI] Image URL: ${imageUrl}`);
    console.log(`[AI] Posting to: ${targetUrl}`);
    const result = await postJSON(targetUrl, {
      imageUrl,
    });
    console.log(
      `[AI] Dump result: isValid=${result.isValid}, confidence=${result.confidence}`,
    );
    return result;
  } catch (error) {
    console.error("[AI] validateDumpImage error:", error.message);
    return {
      isValid: false,
      reasoning: `AI validation failed: ${error.message}`,
      confidence: 0,
    };
  }
};

/**
 * Validates a cleanup proof image.
 * Returns: { isClean, reasoning, confidence }
 */
const validateCleanupImage = async (imageUrl) => {
  try {
    console.log(
      `[AI] Validating cleanup image via Python service: ${imageUrl}`,
    );
    const result = await postJSON(`${AI_SERVICE_URL}/api/validate/cleanup`, {
      imageUrl,
    });
    console.log(
      `[AI] Cleanup result: isClean=${result.isClean}, confidence=${result.confidence}`,
    );
    return result;
  } catch (error) {
    console.error("[AI] validateCleanupImage error:", error.message);
    return {
      isClean: false,
      reasoning: `AI validation failed: ${error.message}`,
      confidence: 0,
    };
  }
};

/** Pre-warm ping (exported for server startup use). */
const pingAIService = () => {
    console.log("[AI] Pre-warming AI service...");
    // Hit root
    wakeUpPing();
    
    // Also hit /health specifically as Phase 1 does
    try {
        const parsed = new URL(AI_SERVICE_URL);
        const lib = parsed.protocol === "https:" ? https : http;
        const req = lib.request({
            hostname: parsed.hostname,
            port: parsed.port,
            path: "/health",
            method: "GET",
        });
        req.on("error", (e) => console.log(`[AI] Pre-warm health check error: ${e.message}`));
        req.end();
    } catch (_) { }
};

module.exports = { validateDumpImage, validateCleanupImage, pingAIService };
