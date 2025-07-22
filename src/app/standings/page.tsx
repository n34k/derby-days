import LeaderBoard from '@/components/LeaderBoard'
import React from 'react'
import { ChartBarIcon } from '@heroicons/react/24/solid'

const StandingsPage = () => {
  return (
    <div className='flex flex-col min-h-screen gap-15 py-15 items-center'>
      <div className='flex items-center gap-3'>
        <h1 className='text-4xl md:text-7xl font-bold'>Live Standings</h1>
        <ChartBarIcon className='w-10 h-10 md:h-20 md:w-20'/>
      </div>
      <div className='flex flex-col gap-30 items-center'>
        <LeaderBoard metric="moneyRaised"/>
        <LeaderBoard metric='points'/>
        <LeaderBoard metric="tshirtsSold"/>
      </div>
    </div>
  )
}

export default StandingsPage