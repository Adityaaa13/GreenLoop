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

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 5000; // 5 s → 10 s → 20 s

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

    req.setTimeout(90000, () => {
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
 */
async function postJSON(url, body) {
  // Send a wake-up ping before the first real attempt
  wakeUpPing();
  await sleep(500); // small grace period

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
      const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
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
    console.log(`[AI] Validating dump image via Python service: ${imageUrl}`);
    const result = await postJSON(`${AI_SERVICE_URL}/api/validate/dump`, {
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
  wakeUpPing();
};

module.exports = { validateDumpImage, validateCleanupImage, pingAIService };
