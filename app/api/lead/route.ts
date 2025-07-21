import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/libs/mongoose";
import Lead from "@/models/Lead";

// This route is used to store the leads that are generated from the landing page.
// The API call is initiated by <ButtonLead /> component
// Duplicate emails just return 200 OK
export async function POST(req: NextRequest) {
  await connectMongo();

  const body = await req.json();

  if (!body.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    // Save the lead in the database (store all fields)
    const lead = await Lead.findOne({ email: body.email });
    if (!lead) {
      await Lead.create({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone,
        message: body.message,
        company_name: body.company_name,
        industry: body.industry,
        company_size: body.company_size,
        createdAt: new Date()
      });
    }

    // Forward to n8n webhook for automation
    const n8nWebhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;

    // Production debugging logs
    console.log(`[Lead API] n8n Webhook URL: ${n8nWebhookUrl ? 'Loaded' : 'Not Loaded'}`);

    if (n8nWebhookUrl) {
      console.log('[Lead API] Attempting to forward lead to n8n...');
      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body), // Forward the entire body
        });
        console.log('[Lead API] Successfully forwarded lead to n8n.');
      } catch (n8nError) {
        console.error('[Lead API] Failed to POST to n8n webhook:', n8nError);
        // Continue, but log the error
      }
    } else {
      console.log('[Lead API] n8n webhook URL not found, skipping forwarding.');
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
