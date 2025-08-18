import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { prisma } from "../../../../../prisma";
import { GetUserSchema } from "../schema";

function extractUserId(url: string): string | null {
    const segments = url.split("/");
    return segments[segments.length - 1] || null;
}

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized user" },
            { status: 401 }
        );
    }

    const id = extractUserId(req.url);
    if (!id) {
        return NextResponse.json(
            { error: "Missing ID in request" },
            { status: 400 }
        );
    }

    const result = GetUserSchema.safeParse({ id });
    if (!result.success) {
        return NextResponse.json(
            { error: "Validation failed", details: result.error.flatten() },
            { status: 400 }
        );
    }

    try {
        const user = await prisma.user.findFirst({
            where: { id: result.data.id },
        });
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, user });
    } catch (err) {
        console.error("GET /api/users/[id] failed", err);
        return NextResponse.json(
            { error: "Couldn't find user" },
            { status: 500 }
        );
    }
}
