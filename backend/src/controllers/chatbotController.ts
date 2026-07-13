import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import axios from "axios";
import { sendSuccess, sendError } from "../utils/response";
import { determinePriority } from "./complaintController";
import type { ComplaintCategory } from "@prisma/client";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.1-8b-instant"; // Fast and capable model on Groq

// Hardcoded rules for the society chatbot
const SOCIETY_RULES = `
You are an Agentic AI Support Assistant for the "Society Maintenance Tracker".
You assist residents with FAQs, queries about their complaints, and YOU HAVE THE POWER TO CREATE COMPLAINTS FOR THEM.

SOCIETY RULES & FAQS:
1. Swimming Pool: Open from 6:00 AM to 10:00 PM. Closed on Mondays for cleaning.
2. Gym: Open from 5:00 AM to 11:00 PM. Requires proper sports shoes.
3. Maintenance Fees: Due on the 5th of every month. A late fee applies after the 10th.
4. Noise Guidelines: Quiet hours are from 10:00 PM to 6:00 AM.
5. Visitor Parking: Maximum 4 hours limit. Overnight parking requires admin approval.
6. Emergencies: If a resident reports a leak, fire, short circuit, or urgent issue, IMMEDIATELY use your tool to create a complaint for them. Do not just tell them to do it.

GUIDELINES:
- Be concise (keep answers under 3-4 sentences).
- If they ask about the status of their complaints, check the context provided below.
- If you use the create_complaint tool, let the resident know the complaint ID and that it was created successfully.
`;

const TOOLS = [
    {
        type: "function",
        function: {
            name: "create_complaint",
            description: "Creates a new maintenance complaint for the resident in the database. Use this when the resident explicitly asks you to raise a complaint or reports a severe emergency (e.g., fire, leak).",
            parameters: {
                type: "object",
                properties: {
                    category: {
                        type: "string",
                        enum: ["PLUMBING", "ELECTRICAL", "CARPENTRY", "CLEANING", "SECURITY", "OTHER"],
                        description: "The category of the complaint."
                    },
                    description: {
                        type: "string",
                        description: "A detailed description of the issue based on what the resident said."
                    }
                },
                required: ["category", "description"]
            }
        }
    }
];

export async function chatWithBot(req: Request, res: Response) {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
        return sendError(res, 400, "VALIDATION_ERROR", "Messages must be an array");
    }

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
        return sendError(res, 500, "CONFIG_ERROR", "AI API key is missing");
    }

    try {
        const userId = req.user!.userId;

        // Fetch context
        const recentComplaints = await prisma.complaint.findMany({
            where: { residentId: userId },
            orderBy: { createdAt: "desc" },
            take: 3,
            select: { id: true, category: true, status: true, description: true }
        });

        const resident = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true }
        });

        let contextString = `\nThe resident's name is ${resident?.name || "Resident"}.\n`;
        if (recentComplaints.length > 0) {
            contextString += `Here are their recent complaints (ID, Category, Status):\n`;
            recentComplaints.forEach(c => {
                contextString += `- ID: ${c.id} | ${c.category} | ${c.status}\n`;
            });
        } else {
            contextString += "They have no recent complaints.\n";
        }

        const systemMessage = {
            role: "system",
            content: SOCIETY_RULES + contextString
        };

        const payload = {
            model: MODEL_NAME,
            messages: [systemMessage, ...messages],
            tools: TOOLS,
            tool_choice: "auto",
            temperature: 0.5,
            max_tokens: 200
        };

        // 1st API Call to Groq
        const response = await axios.post(GROQ_API_URL, payload, {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }
        });

        let replyMessage = response.data.choices[0].message;

        // Check if the AI wants to call a tool
        if (replyMessage.tool_calls && replyMessage.tool_calls.length > 0) {
            const toolCall = replyMessage.tool_calls[0];

            if (toolCall.function.name === "create_complaint") {
                const args = JSON.parse(toolCall.function.arguments);
                const priority = determinePriority(args.description);

                // Create the complaint in the database!
                const newComplaint = await prisma.complaint.create({
                    data: {
                        residentId: userId,
                        category: args.category as ComplaintCategory,
                        description: args.description,
                        status: "OPEN",
                        priority,
                        history: {
                            create: {
                                oldStatus: null,
                                newStatus: "OPEN",
                                changedBy: userId,
                                note: "Complaint auto-created by AI Assistant",
                            },
                        }
                    }
                });

                // Prepare the second payload with the tool result
                const toolResultMsg = {
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: toolCall.function.name,
                    content: `Success! Created complaint with ID: ${newComplaint.id}`
                };

                const secondPayload = {
                    model: MODEL_NAME,
                    messages: [systemMessage, ...messages, replyMessage, toolResultMsg],
                    temperature: 0.5,
                    max_tokens: 150
                };

                // 2nd API Call to Groq (to get final natural language response)
                const secondResponse = await axios.post(GROQ_API_URL, secondPayload, {
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json"
                    }
                });

                replyMessage = secondResponse.data.choices[0].message;
                return sendSuccess(res, { reply: replyMessage, toolExecuted: true });
            }
        }

        return sendSuccess(res, { reply: replyMessage, toolExecuted: false });
    } catch (err: any) {
        console.error("Chatbot Error:", err.response?.data || err.message);
        return sendError(res, 500, "AI_ERROR", "Failed to generate a response from the AI");
    }
}
