'use client'
import React, { useState } from 'react'
import Link from 'next/link';


const DonationInput = () => {
  const [donationInput, setDonationInput] = useState<string>(''); // empty initially

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setDonationInput(value);
    }
  };

  const parsedAmount = parseInt(donationInput, 10);
  const donationAmount = !isNaN(parsedAmount) ? parsedAmount : '';

  return (
    <div className="flex flex-col items-center gap-5 space-x-5 w-fit">
      <div className='flex items-center gap-2.5'>
          <p className="text-info-content md:text-3xl">$</p>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={donationAmount}
            onChange={handleChange}
            className="input input-xl text-center w-60 h-60 shadow-sm text-9xl"
          />
      </div>
      <Link 
        className='btn btn-secondary btn-lg p-3 transition duration-300 hover:text-secondary hover:scale-110' 
        href={`/checkout?amount=${donationAmount}`}
        onClick={(e) => {
          if (!donationAmount) {
            e.preventDefault(); // cancel the navigation
          }
        }}
      >
        Donate
      </Link>
    </div>
  );
};

export default DonationInput;
