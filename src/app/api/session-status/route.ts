import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../../lib/stripe";

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const session_id = searchParams.get("session_id");

    if (!session_id) {
        return NextResponse.json(
            { error: "Missing session_id" },
            { status: 400 }
        );
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id);
        return NextResponse.json({ status: session.status });
    } catch (error) {
        console.error("Failed to retrieve session:", error);
        return NextResponse.json(
            { error: "Failed to retrieve session" },
            { status: 500 }
        );
    }
}
