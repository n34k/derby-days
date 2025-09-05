import { isAdmin } from "@/lib/isAdmin";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { email: string } }
) {
    if (!(await isAdmin())) {
        return NextResponse.json(
            { error: "User needs to be admin to do this" },
            { status: 401 }
        );
    }

    try {
        const p = await params;
        const email = decodeURIComponent(p.email ?? "");

        if (!email) {
            return NextResponse.json(
                { error: "Email not found in request" },
                { status: 400 }
            );
        }

        const emailExists = await prisma.brotherEmails.findUnique({
            where: { email },
        });

        if (!emailExists) {
            return NextResponse.json(
                { error: "Email does not exist in database" },
                { status: 404 }
            );
        }

        const emailDeleted = await prisma.brotherEmails.delete({
            where: { email },
        });

        return NextResponse.json(emailDeleted, { status: 200 });
    } catch (e) {
        return NextResponse.json(
            { error: "Failed to delete email", e },
            { status: 400 }
        );
    }
}
