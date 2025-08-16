import React from 'react'
import { prisma } from '../../prisma'
import { CurrencyDollarIcon } from '@heroicons/react/24/solid';

const RecentDonations = async () => {
  const donations = await prisma.donation.findMany({ orderBy: { createdAt: 'desc'} });

  return (
    <div>
      <div className='flex items-center gap-3 mb-3'>
        <h1 className='text-4xl md:text-7xl font-bold'>Live Donations</h1>
        <CurrencyDollarIcon className='w-10 h-10 md:h-20 md:w-20'/>
      </div>
      <div className='flex flex-col gap-10'>
        {donations.map(d => (
          <div className='flex flex-col items-center' key={d.id}>
            <p className='text-success text-4xl'>${d.amount}</p>
            <p className='text-3xl'>{d.name}</p>
            {d.note && <p className='text-3xl'>&quot;{d.note}&quot;</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentDonations