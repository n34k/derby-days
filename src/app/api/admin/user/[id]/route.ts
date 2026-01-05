import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { prisma } from "../../../../../../prisma";
import { AdminUpdateUserSchema } from "../schema";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

function extractIdFromUrl(url: string): string | null {
    const segments = url.split("/");
    return segments[segments.length - 1] || null;
}

export async function PATCH(req: NextRequest) {
    const session = await auth();
    const user = session?.user;

    if (!user || user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = extractIdFromUrl(req.url);
    if (!id) {
        return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const result = AdminUpdateUserSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 });
    }

    const data = result.data;

    try {
        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const updatedUser = await prisma.user.update({ where: { id }, data });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (err) {
        console.error("Update failed", err);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const session = await auth();
    const user = session?.user;

    if (!user || user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = extractIdFromUrl(req.url);
    if (!id) {
        return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    const userToDelete = await prisma.user.findUnique({ where: { id } });

    if (!userToDelete) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try {
        if (userToDelete.imagePublicId) {
            await cloudinary.uploader.destroy(userToDelete.imagePublicId || "");
        }

        await prisma.user.delete({
            where: { id },
        });

        const emailToDelete = await prisma.brotherEmails.findUnique({
            where: { email: userToDelete.email },
        });

        if (emailToDelete) {
            await prisma.brotherEmails.delete({
                where: { email: userToDelete.email },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete user:", error);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
