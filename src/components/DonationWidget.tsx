import React from 'react'
import DonationInput from './DonationInput';

const DonationWidget = () => {
  return (
    <div className='flex flex-col items-center gap-5 bg-primary p-5 rounded-2xl border-secondary border-2 shadow-lg'>
        <div className='flex flex-col text-center'>
            <h1 className="text-4xl font-bold text-secondary">Donate Directly</h1>
            <p className='text-info-content text-sm md:text-base'>CHOOSE AMOUNT</p>
        </div>
        <DonationInput/>
    </div>
  )
}

export default DonationWidget