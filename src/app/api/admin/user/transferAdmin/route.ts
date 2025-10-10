// app/api/admin/transfer-admin/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";
import { isAdmin } from "@/lib/isAdmin";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { newAdminId } = await req.json().catch(() => ({}));
        if (!newAdminId) {
            return NextResponse.json(
                { error: "Missing newAdminId" },
                { status: 400 }
            );
        }
        console.log("NEW ADMIN ID", newAdminId);
        const user = await prisma.user.findUnique({
            where: { id: newAdminId },
        });

        console.log("Selected user for admin transfer:", user);
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Prevent no-op: if already admin
        if (user.globalRole === "ADMIN") {
            return NextResponse.json(
                { error: "Selected user is already an admin" },
                { status: 400 }
            );
        }

        await prisma.$transaction([
            // Demote all current admins to BROTHER (in case you ever have >1)
            prisma.user.updateMany({
                where: { globalRole: "ADMIN" },
                data: { globalRole: "BROTHER" },
            }),
            // Promote selected user
            prisma.user.update({
                where: { id: newAdminId },
                data: { globalRole: "ADMIN" },
            }),
        ]);

        // Ensure admin page reflects new roles
        revalidatePath("/admin");

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        console.error("transfer-admin error:", err);
        return NextResponse.json(
            { error: err || "Internal Server Error" },
            { status: 500 }
        );
    }
}
