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
        createdAt: new Date()
      });
    }

    // Forward to n8n webhook for automation (update the URL as needed)
    try {
      await fetch('https://erland.app.n8n.cloud/webhook-test/lead-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: body.first_name,
          last_name: body.last_name,
          email: body.email,
          phone: body.phone,
          message: body.message
        })
      });
    } catch (n8nError) {
      console.error('Failed to POST to n8n webhook:', n8nError);
      // Continue, but log the error
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
