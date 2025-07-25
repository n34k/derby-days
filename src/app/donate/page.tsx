import React from 'react'

import { HeartIcon } from '@heroicons/react/24/solid'
import DonationWidget from '@/components/DonationWidget'
import AdPurchaseWidget from '@/components/AdPurchaseWidget'
import ShirtPurcahseWidget from '@/components/ShirtPurcahseWidget'

const DonatePage = () => {
  return (
    <div className='flex flex-col min-h-screen gap-10 py-15 items-center'>
      <div className='flex items-center gap-3'>
        <h1 className='text-4xl md:text-7xl font-bold'>Support the Cause</h1>
        <HeartIcon className='w-10 h-10 md:h-18 md:w-18'/>
      </div>
      <div className='flex flex-col items-center justify-center gap-5 md:flex-row md:gap-25'>
        <DonationWidget/>
        <AdPurchaseWidget/>
        <ShirtPurcahseWidget/>
      </div>
    </div>
  )
}

export default DonatePage