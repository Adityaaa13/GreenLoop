const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GOOGLE_API_KEY,
});

/**
 * Validates a garbage dump image using Gemini Flash.
 * Expected to return a JSON string with format { "isValid": boolean, "reasoning": string, "confidence": number }
 * @param {string} imageUrl
 * @returns {Promise<Object>}
 */
const validateDumpImage = async (imageUrl) => {
    try {
        const prompt = `
      Analyze the provided image URL.
      Determine if it shows a valid garbage dump, litter, or waste site that requires cleaning.
      Respond strictly in JSON format without markdown blocks:
      {
        "isValid": true/false, // true if it's a valid garbage dump that needs cleaning, false otherwise
        "reasoning": "brief explanation", // max 2 sentences explaining why
        "confidence": 0.95 // confidence score between 0.0 and 1.0
      }
      
      Image URL: ${imageUrl}
    `;

        // Note: To properly analyze an image from a URL, we should ideally pass a message array
        // with an image_url content block. Doing that to ensure Gemini sees the image perfectly.
        const response = await model.invoke([
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: prompt,
                    },
                    {
                        type: "image_url",
                        image_url: { url: imageUrl },
                    },
                ],
            },
        ]);

        let jsonStr = response.content;
        // Strip markdown formatting if Gemini included it
        jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI Validation Error:", error);
        // Fallback if AI fails to parse
        return {
            isValid: false,
            reasoning: "AI validation failed or unable to process image.",
            confidence: 0
        };
    }
};

/**
 * Validates a cleanup image using Gemini Flash.
 * Expected to return { "isClean": boolean, "reasoning": string, "confidence": number }
 * @param {string} imageUrl
 * @returns {Promise<Object>}
 */
const validateCleanupImage = async (imageUrl) => {
    try {
        const prompt = `
      Analyze the provided image URL.
      Determine if it shows a place that has been recently cleaned (e.g. no visible garbage dump or litter where there might have been one).
      Respond strictly in JSON format without markdown blocks:
      {
        "isClean": true/false, // true if the area looks clean and free of garbage, false otherwise
        "reasoning": "brief explanation", // max 2 sentences explaining why
        "confidence": 0.95 // confidence score between 0.0 and 1.0
      }
      
      Image URL: ${imageUrl}
    `;

        const response = await model.invoke([
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: imageUrl } },
                ],
            },
        ]);

        let jsonStr = response.content;
        jsonStr = jsonStr.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI Cleanup Validation Error:", error);
        return {
            isClean: false,
            reasoning: "AI validation failed or unable to process image.",
            confidence: 0
        };
    }
};

module.exports = { validateDumpImage, validateCleanupImage };
