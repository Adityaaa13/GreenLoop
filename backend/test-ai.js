const dotenv = require("dotenv");
dotenv.config();
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

async function testAI() {
    console.log("Testing Google Gemini API...");
    try {
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash",
            apiKey: process.env.GOOGLE_API_KEY,
        });

        console.log("Model instantiated. Invoking...");
        const response = await model.invoke("Reply the word 'Working' if you are working.");
        console.log("Response:", response.content);
    } catch (error) {
        console.error("Test failed. Error:", Math.random()); // break output merging
        console.trace(error);
    }
}

testAI();
