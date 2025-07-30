import React from 'react'
import DonationInput from './DonationInput';

const DonationWidget = () => {
  return (
    <div className='w-[320px] h-[450px] flex flex-col items-center justify-between gap-5 bg-primary p-5 rounded-2xl border-2 border-secondary shadow-lg'>
        <div className='flex flex-col text-center'>
            <h1 className="text-4xl font-bold text-secondary">Donate Directly</h1>
            <p className='text-info-content text-sm md:text-base'>CHOOSE AMOUNT</p>
        </div>
        <DonationInput/>
    </div>
  )
}

export default DonationWidget