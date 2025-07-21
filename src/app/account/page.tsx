import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import React from 'react'
import { cookies } from "next/headers";

import UpdateUserForm from "@/section/UpdateUserForm";
import AdminPanel from "@/section/AdminPanel";

async function AccountPage() {
  const session = await auth();
  if(!session) 
    redirect("/")
  const cookie = await cookies()
  const cookieHeader = cookie.toString();
  const res = await fetch(`http://localhost:3000/api/user/${session.user?.id}`, {headers: {cookie: cookieHeader}});
  if (!res.ok)
    console.error("Failed to fetch user");
  
  const { user: userData } = await res.json();

  return (
    <div className="flex flex-col items-center justify-center py-15 gap-15 min-h-screen md:flex-row md:p-15">
      <UpdateUserForm initialImage={userData.image} initialName={userData.name} initialWalkoutSong={userData.walkoutSong} initialPublicId={userData.imagePublicId}/>
      {userData.globalRole === 'ADMIN' && <AdminPanel/>}
    </div>
  )
}

export default AccountPage