import React from 'react'
import { prisma } from '../../../../prisma'

interface TeamPageProps {
  params: { teamId: string };
}

const TeamPage = async ({ params }: TeamPageProps) => {
  const p = await params;
  const team = await prisma.team.findUnique({where: { id: p.teamId }});
  if (!team) {
    return <div>Team not found</div>
  }

  return (
    <div>{team.name}</div>
  )
}

export default TeamPage