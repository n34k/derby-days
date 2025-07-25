import Link from 'next/link'
import React from 'react'

import { prisma } from '../../prisma'

const AdPurchaseWidget = async () => {
  const ads = await prisma.product.findMany({where: {category: 'ad'}, orderBy: { price: 'desc' } })

  return (
    <div className='flex flex-col items-center gap-5 bg-primary p-5 rounded-2xl border-secondary border-2 shadow-lg'>
      <div className='flex flex-col text-center'>
          <h1 className="text-4xl font-bold text-secondary">Purchase Ad</h1>
          <p className='text-info-content text-sm md:text-base'>CHOOSE SIZE</p>
      </div>
      <div className='flex flex-col gap-7.5'>
        {Object.values(ads).map((ad) => (
          <Link key={ad.priceId} href={`/checkout/${ad.priceId}`} className="btn btn-secondary w-45 text-center">
            {ad.name}: ${ad.price/100}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default AdPurchaseWidget