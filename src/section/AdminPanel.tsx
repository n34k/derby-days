// AdminPanel.tsx
import { UsersTable } from "@/components/UsersTable";
import { TeamsTable } from "@/components/TeamsTable";
import { TransactionsTable } from "@/components/TransactionsTable";
import { prisma } from "../../prisma";
import { auth } from "../../auth";
import { redirect } from "next/navigation";
import { User } from "@/generated/prisma";

const AdminPanel = async () => {
  const session = await auth();
  const user = session?.user as User;

  if (user.globalRole !== "ADMIN") redirect("/");

  const users = await prisma.user.findMany({ include: { team: true } });
  const teams = await prisma.team.findMany({include: { headCoach: true, derbyDarling: true }});
  const transactions = await prisma.externalTransaction.findMany();

  return (
    <div className="flex flex-col bg-primary p-5 rounded-[var(--radius-box)] gap-5 w-[90vw] md:w-auto md:overflow-y-auto">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <UsersTable users={users}/>
      <TeamsTable teams={teams}/>
      <TransactionsTable transactions={transactions} />
    </div>
  );
};

export default AdminPanel;
