import { isAdmin } from "@/lib/isAdmin";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../prisma";
import { sendSignUpEmail } from "@/lib/emailService";

export async function GET() {
    try {
        const emails = await prisma.brotherEmails.findMany();
        return NextResponse.json({ emails });
    } catch (e) {
        return NextResponse.json(
            { error: "Failed to get emails", e },
            { status: 404 }
        );
    }
}

export async function POST(req: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json(
            { error: "User needs to be admin to do this" },
            { status: 401 }
        );
    }

    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email not found in request" },
                { status: 400 }
            );
        }

        const emailExists = await prisma.brotherEmails.findUnique({
            where: { email },
        });

        console.log("emailExists", emailExists);

        if (emailExists) {
            return NextResponse.json(
                { error: "Email already exists in database" },
                { status: 409 }
            );
        }

        const emailAdded = await prisma.brotherEmails.create({
            data: { email },
        });

        await sendSignUpEmail({ to: email });

        return NextResponse.json(emailAdded, { status: 200 });
    } catch (e) {
        return NextResponse.json(
            { error: "Failed to add email", e },
            { status: 500 }
        );
    }
}
