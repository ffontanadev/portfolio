import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;

const client = twilio(accountSid, authToken);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, variables } = body;

    if (!to || !variables) {
      return NextResponse.json(
        { error: 'Parámetros "to" y "variables" son requeridos.' },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      from: "whatsapp:+14155238886",
      contentSid: "HXb5b62575e6e4ff6129ad7c8efe1f983e",
      contentVariables: '{"1":"12/1","2":"3pm"}',
      to: "whatsapp:+59899201598",
    });

    return NextResponse.json({ sid: message.sid }, { status: 200 });
  } catch (error: any) {
    console.error("Error enviando mensaje:", error);
    return NextResponse.json(
      { error: "Error interno al enviar el mensaje", detail: error.message },
      { status: 500 }
    );
  }
}
