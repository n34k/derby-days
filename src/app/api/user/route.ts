import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { prisma } from "../../../../prisma";
import { UpdateUserSchema } from "./schema";

export async function PATCH(req: NextRequest) {
    const session = await auth()
    if (!session) 
        return NextResponse.json({error: "Unauthorized user"}, {status: 401});

    let body;
    try {
        body = await req.json();
    } 
    catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const result = UpdateUserSchema.safeParse(body);

    if (!result.success)
        return NextResponse.json({ error: "Validation failed", details: result.error.flatten() }, { status: 400 });

    const { name, image, walkoutSong } = result.data;

    try {
        await prisma.user.update({
            where: { id: session.user?.id },
            data: { name, image, walkoutSong }
        });
        return NextResponse.json({ success: true });
    }
    catch (err) {
        console.log(err);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

