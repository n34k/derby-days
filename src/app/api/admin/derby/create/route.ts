import { NextResponse } from "next/server";
import { prisma } from "../../../../../../prisma";
import { isAdmin } from "@/lib/isAdmin";
import { v2 as cloudinary } from "cloudinary";
import getYear from "@/lib/getYear";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// this route will delete all teams, donations, ad purchases, draft picks, tshirt purchases,
// reset user stats, delete all JUDGE users (and their images + brotherEmails),
// and set all remaining non-ADMIN users to BROTHER
export async function POST() {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const year = getYear();

        // 1) Read teams first to capture Cloudinary public IDs before deletion
        const teams = await prisma.team.findMany({
            select: { id: true, derbyDarlingPublicId: true },
        });
        const teamPublicIds = teams.map((t) => t.derbyDarlingPublicId).filter((p): p is string => Boolean(p));

        // 2) Read JUDGE users first (we need their emails & image public IDs before deleteMany)
        const judgeUsers = await prisma.user.findMany({
            where: { globalRole: "JUDGE" },
            select: { id: true, email: true, imagePublicId: true },
        });
        const judgeUserIds = judgeUsers.map((u) => u.id);
        const judgeEmails = judgeUsers.map((u) => u.email).filter((e): e is string => Boolean(e));
        const judgeImagePublicIds = judgeUsers.map((u) => u.imagePublicId).filter((p): p is string => Boolean(p));

        // 3) Database cleanup & seed (transaction = all-or-nothing for DB changes)
        await prisma.$transaction([
            // Reset user stats for everyone (keep your change: moneyRaised = 0)
            prisma.user.updateMany({
                data: { teamId: null, moneyRaised: 0 },
            }),

            // Delete dependents first (avoid FK issues)
            prisma.donation.deleteMany({}),
            prisma.adPurchase.deleteMany({}),
            prisma.draftPick.deleteMany({}),
            prisma.tshirtPurchase.deleteMany({}),
            prisma.scheduleEntry.deleteMany({}),

            // Delete teams
            prisma.team.deleteMany({}),

            // Remove judge emails from whitelist/allowlist table if present
            judgeEmails.length
                ? prisma.brotherEmails.deleteMany({
                      where: { email: { in: judgeEmails } },
                  })
                : // If no judges, do a no-op update (transaction requires all array entries be Prisma actions)
                  prisma.user.updateMany({ where: { id: "" }, data: {} }),

            // Delete all JUDGE users
            judgeUserIds.length
                ? prisma.user.deleteMany({
                      where: { id: { in: judgeUserIds } },
                  })
                : prisma.user.updateMany({ where: { id: "" }, data: {} }),

            // Make all remaining non-admin users BROTHER
            prisma.user.updateMany({
                where: { globalRole: { not: "ADMIN" } },
                data: { globalRole: "BROTHER" },
            }),

            // Create derby days
            prisma.derbyStats.create({
                data: { id: year },
            }),
        ]);

        // 4) Cloudinary cleanup (outside DB transaction; best-effort)
        //    - Team images
        let cloudinaryDeletedTeams: string[] = [];
        if (teamPublicIds.length > 0) {
            try {
                const result = await cloudinary.api.delete_resources(teamPublicIds);
                cloudinaryDeletedTeams = Object.entries(result.deleted || {})
                    .filter(([, status]) => status === "deleted")
                    .map(([id]) => id);
            } catch (e) {
                console.error("Cloudinary team image deletion error:", e);
            }
        }

        //    - Judge user profile images
        let cloudinaryDeletedJudges: string[] = [];
        if (judgeImagePublicIds.length > 0) {
            try {
                const result = await cloudinary.api.delete_resources(judgeImagePublicIds);
                cloudinaryDeletedJudges = Object.entries(result.deleted || {})
                    .filter(([, status]) => status === "deleted")
                    .map(([id]) => id);
            } catch (e) {
                console.error("Cloudinary judge image deletion error:", e);
            }
        }

        //revalidatePath("/admin");

        return NextResponse.json({
            success: true,
            derbyStats: { id: year, status: "CREATED" },
            deleted: {
                teams: teams.length,
                cloudinaryTeamRequested: teamPublicIds.length,
                cloudinaryTeamDeleted: cloudinaryDeletedTeams,
                judgeUsers: judgeUsers.length,
                judgeEmailsRemoved: judgeEmails.length,
                cloudinaryJudgeRequested: judgeImagePublicIds.length,
                cloudinaryJudgeDeleted: cloudinaryDeletedJudges,
            },
        });
    } catch (err) {
        console.error("Create Derby Days error:", err);
        return NextResponse.json({ error: (err as Error)?.message || "Internal Server Error" }, { status: 500 });
    }
}
