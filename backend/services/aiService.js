const { GoogleGenAI } = require("@google/genai");
const https = require("https");

// Network workaround for restricted DNS preventing API calls
require("node:dns").setServers(["1.1.1.1", "8.8.8.8"]);

// Initialize the official Google Gen AI SDK (trim key to avoid whitespace from .env)
const apiKey = (process.env.GOOGLE_API_KEY || "").trim();
console.log(`[AI Init] API Key loaded: ${apiKey ? apiKey.substring(0, 8) + "..." : "MISSING!"}`);
const ai = new GoogleGenAI({ apiKey });

// Models to try in order — if one model's quota is exhausted, fall back to the next
const MODELS = ["gemini-2.5-flash",
  "gemini-2.5-pro"];

/**
 * Helper: wraps a promise with a timeout so it doesn't hang forever.
 */
function withTimeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`AI request timed out after ${ms / 1000}s`)), ms)
        )
    ]);
}

/**
 * Calls Gemini with automatic model fallback.
 * If a model's quota is exhausted (429), tries the next model in the list.
 */
async function callGeminiWithFallback(contents) {
    let lastError;

    for (const model of MODELS) {
        try {
            console.log(`[AI] Trying model: ${model}`);
            const response = await withTimeout(
                ai.models.generateContent({ model, contents }),
                30000
            );
            console.log(`[AI] Success with model: ${model}`);
            return response;
        } catch (error) {
            lastError = error;
            const msg = (error.message || "").toLowerCase();
            // Only fallback on quota/rate-limit errors; other errors should fail immediately
            if (msg.includes("429") || msg.includes("quota") || msg.includes("exhausted") || msg.includes("resource_exhausted")) {
                console.warn(`[AI] Model ${model} quota exhausted, trying next...`);
                continue;
            }
            // Non-quota error — don't try other models
            throw error;
        }
    }

    // All models exhausted
    throw lastError;
}

/**
 * Transforms a Cloudinary URL to request a compressed, resized version.
 * This dramatically reduces the base64 size and Gemini token usage.
 * e.g. .../upload/v123/file.jpg → .../upload/w_512,h_512,c_limit,q_60,f_jpg/v123/file.jpg
 */
function getCompressedUrl(url) {
    // Only transform Cloudinary URLs
    if (!url.includes("res.cloudinary.com")) return url;
    // Insert transformation params right after /upload/
    const transformed = url.replace(
        "/upload/",
        "/upload/w_512,h_512,c_limit,q_60,f_jpg/"
    );
    console.log(`[AI] Compressed image URL: ${transformed}`);
    return transformed;
}

/**
 * Fetches an image URL and converts it to raw base64 data and mimeType.
 * Automatically compresses Cloudinary images to reduce token usage.
 */
function fetchImageData(url) {
    const compressedUrl = getCompressedUrl(url);
    return new Promise((resolve, reject) => {
        https.get(compressedUrl, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to fetch image: HTTP ${res.statusCode} ${res.statusMessage}`));
            }

            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const base64Str = buffer.toString('base64');
                const mimeType = res.headers['content-type'] || 'image/jpeg';
                resolve({ base64: base64Str, mimeType });
            });
        }).on('error', (err) => reject(err));
    });
}

/**
 * Validates a garbage dump image using Gemini with automatic model fallback.
 */
const validateDumpImage = async (imageUrl) => {
    try {
        console.log(`[AI Debug] Fetching image for Gemini: ${imageUrl}`);
        const { base64, mimeType } = await fetchImageData(imageUrl);
        console.log(`[AI Debug] Image fetched. size=${base64.length}, type=${mimeType}`);

        const prompt = `
      Analyze the provided image.
      Determine if it shows a valid garbage dump, litter, or waste site that requires cleaning.
      Respond strictly in JSON format without markdown blocks:
      {
        "isValid": true/false, // true if it's a valid garbage dump that needs cleaning, false otherwise
        "reasoning": "brief explanation", // max 2 sentences explaining why
        "confidence": 0.95 // confidence score between 0.0 and 1.0
      }
    `;

        const contents = [
            prompt,
            { inlineData: { data: base64, mimeType } }
        ];

        const response = await callGeminiWithFallback(contents);

        const rawText = response.text;
        console.log(`[AI Debug] Raw Gemini response: ${rawText}`);
        let jsonStr = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

        const parsed = JSON.parse(jsonStr);
        console.log(`[AI Debug] Parsed: isValid=${parsed.isValid}, confidence=${parsed.confidence}`);
        return parsed;
    } catch (error) {
        console.error("AI Validation Error:", error?.message || error);

        return {
            isValid: false,
            reasoning: `AI validation failed: ${error.message}`,
            confidence: 0
        };
    }
};

/**
 * Validates a cleanup image using Gemini with automatic model fallback.
 */
const validateCleanupImage = async (imageUrl) => {
    try {
        const { base64, mimeType } = await fetchImageData(imageUrl);

        const prompt = `
      Analyze the provided image.
      Determine if it shows a place that has been recently cleaned (e.g. no visible garbage dump or litter where there might have been one).
      Respond strictly in JSON format without markdown blocks:
      {
        "isClean": true/false, // true if the area looks clean and free of garbage, false otherwise
        "reasoning": "brief explanation", // max 2 sentences explaining why
        "confidence": 0.95 // confidence score between 0.0 and 1.0
      }
    `;

        const contents = [
            prompt,
            { inlineData: { data: base64, mimeType } }
        ];

        const response = await callGeminiWithFallback(contents);

        const rawText = response.text;
        console.log(`[AI Debug Cleanup] Raw response: ${rawText}`);
        let jsonStr = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI Cleanup Validation Error:", error?.message || error);

        return {
            isClean: false,
            reasoning: `AI validation failed: ${error.message}`,
            confidence: 0
        };
    }
};

module.exports = { validateDumpImage, validateCleanupImage };
