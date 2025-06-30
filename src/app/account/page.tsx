import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import React from 'react'
import { cookies } from "next/headers";

import UpdateUserForm from "@/components/UpdateUserForm";

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
    <section className="p-15">
      <h1>Welcome {userData.name}</h1>
      <UpdateUserForm initialImage={userData.image} initialName={userData.name} initialWalkoutSong={userData.walkoutSong}/>
    </section>
  )
}

export default AccountPage