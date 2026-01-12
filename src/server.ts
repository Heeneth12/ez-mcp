import express from "express";
import cors from "cors";
import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { getGeminiTools, executeTool } from "./ai/toolRegistry";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 8085;
const apiKey = process.env.GEMINI_API_KEY;
const devUrl = process.env.SERVER_URL + "/v1/mcp/chat";

if (!apiKey) throw new Error("GEMINI_API_KEY required");

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

// Helper: Fetch History
async function getChatHistory(conversationId: number, token: string): Promise<Content[]> {
    if (!conversationId) return [];
    
    try {
        const response = await axios.get(`${devUrl}/${conversationId}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const messages = response.data.data || [];
        return messages.map((msg: any) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));
    } catch (error) {
        console.warn(`Failed to load history for ${conversationId}`, error);
        return [];
    }
}

app.post("/v1/ai/generate", async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ reply: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1];

        if (!message) return res.status(400).json({ reply: "Message required." });

        // FETCH HISTORY
        const history = await getChatHistory(conversationId, token);
        console.log(`Loaded ${history.length} previous messages for context.`);

        // START CHAT WITH HISTORY
        const chat = model.startChat({ 
            history: history,
            tools: getGeminiTools() as any 
        });

        // SEND MESSAGE
        const result = await chat.sendMessage(message);
        const response = result.response;
        const calls = response.functionCalls();
        let finalAiReply = "";

        if (calls && calls.length > 0) {
            const call = calls[0];
            console.log(`🤖 AI invoking tool: ${call.name}`);
            
            const toolOutput = await executeTool(call.name, call.args, token);

            const finalResponse = await chat.sendMessage([{
                functionResponse: {
                    name: call.name,
                    response: { content: toolOutput }
                }
            }]);
            finalAiReply = finalResponse.response.text();
        } else {
            finalAiReply = response.text();
        }
        res.json({ reply: finalAiReply });
    } catch (error: any) {
        console.error("Error:", error);
        res.status(500).json({ reply: "I encountered an internal error." });
    }
});

app.listen(port, () => {
    console.log(`🚀 MCP Worker running`);
});