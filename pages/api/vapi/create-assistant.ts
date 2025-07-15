import type { NextApiRequest, NextApiResponse } from 'next';
import vapi from '../../../libs/vapi';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const assistant = await vapi.assistants.create({
      name: "Customer Service Assistant",
      firstMessage: "Hello! Thank you for calling our customer service. How can I assist you today?",
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a helpful customer service representative for [Your Company].\nYou can help with: order status, product info, store hours, appointments, and general questions.\nOffer to transfer to a human for complex issues.\nKeep responses concise and conversational.`
          }
        ],
        temperature: 0.7,
        tools: [
        {
          type: "function",
          function: {
            name: "lookup_appointment",
            description: "Look up user's appointments by phone number and date",
            parameters: {
              type: "object",
              properties: {
                phoneNumber: { type: "string", description: "User's phone number" },
                date: { type: "string", format: "date", description: "Date to look up" }
              },
              required: ["phoneNumber", "date"]
            }
          },
          server: {
            url: "http://localhost:3000/api/vapi/tool-handler" // Update this to your deployed domain
          }
        },
        {
          type: "function",
          function: {
            name: "lookup_order",
            description: "Retrieve order status and details by order number",
            parameters: {
              type: "object",
              properties: {
                orderNumber: { type: "string", description: "The order number to look up" }
              },
              required: ["orderNumber"]
            }
          },
          server: {
            url: "http://localhost:3000/api/vapi/order-tool-handler" // Update this to your deployed domain
          }
        }
      ]
    },
    voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM" // Rachel voice
      },
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US"
      },

      maxDurationSeconds: 600, // 10 minutes
      endCallPhrases: ["goodbye", "thank you, bye", "have a great day"],
      backgroundSound: "office"
    });

    res.status(200).json({ assistant });
  } catch (error) {
    console.error("Failed to create assistant:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : error });
  }
}
