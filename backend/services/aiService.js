/**
 * AI Service — delegates image validation to the Python garbage_image_tester microservice.
 * Python service must be running at PYTHON_AI_SERVICE_URL (default: http://localhost:8000)
 */

const http = require("http");
const https = require("https");

const AI_SERVICE_URL = (
  process.env.PYTHON_AI_SERVICE_URL || "http://localhost:8000"
).replace(/\/$/, "");

/**
 * Makes a POST request to the Python AI service with a JSON body.
 */
function postJSON(url, body) {
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
            reject(new Error(`Failed to parse AI service response: ${data}`));
          }
        });
      },
    );

    req.setTimeout(60000, () => {
      req.destroy(new Error("AI service request timed out after 60s"));
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

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

const pingAIService = () => {
  try {
    console.log("[AI] Pre-warming AI service...");
    const parsed = new URL(AI_SERVICE_URL);
    const lib = parsed.protocol === "https:" ? https : http;
    const req = lib.request(
        { hostname: parsed.hostname, port: parsed.port, path: "/", method: "GET" }
    );
    req.on("error", () => {}); // Ignore ping errors
    req.end();
  } catch (err) {
    // Ignore internal errors
  }
};

module.exports = { validateDumpImage, validateCleanupImage, pingAIService };
