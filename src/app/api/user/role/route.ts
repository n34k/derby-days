import { NextResponse } from "next/server";
import { auth } from "../../../../../auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // avoid caching

export async function GET() {
    const session = await auth();
    const role = session?.user?.role ?? null;
    return NextResponse.json(role, { status: 200 });
}
