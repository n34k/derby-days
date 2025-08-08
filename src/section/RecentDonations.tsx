import React from 'react'
import { prisma } from '../../prisma'


const RecentDonations = async () => {
  const donations = await prisma.donation.findMany({ orderBy: { createdAt: 'desc'} });
  const adPurchases = await  prisma.adPurchase.findMany({ orderBy: { createdAt: 'desc'} });

  

  console.log('DONATIONS', donations);
  console.log('ADS', adPurchases);

  return (
    <div>
        {}
    </div>
  )
}

export default RecentDonations