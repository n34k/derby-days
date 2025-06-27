import Image from 'next/image'
import React from 'react'

const WhatSection = () => {
  return (
    <section className='flex relative bg-primary items-center justify-center min-h-[50vh] w-full py-6 px-5'>
        <div className='flex flex-col md:flex-row justify-center align-middle bg-accent w-full max-w-6xl rounded-box p-5 md:p-7 gap-5 md:gap-7 transition duration-300 transform hover:scale-105'>
            <div className='flex flex-col gap-3 w-full md:w-1/2 text-center md:text-left'>
                <h1 className='text-5xl text-primary-content'>What is Derby Days?</h1>
                <p className='text-primary-content'>
                    Derby Days is Sigma Chi&apos;s national philanthropy event — a spirited, week-long competition that brings together fraternities, sororities,
                    and the campus community to raise funds for a meaningful cause. Through challenges, performances, team spirit, and campus engagement, Derby
                    Days unites fun with purpose. At its heart, Derby Days is about making a difference. Every dollar raised supports Valley Childrens hospital, helping
                    fund research, provide care, and uplift lives. We are proud to say the Epsilon Eta chapter has raised over $250,000 and counting to date. Derby Days is 
                    tradition, competition, and service — all rolled into one unforgettable week.
                </p>
            </div>
            <div className='flex justify-center w-full md:w-1/2 rounded-xl max-h-[300px] md:max-h-none'>
                <Image src="/images/ddcheck.jpeg" alt='Valley Childrens check' width={300} height={300} className="object-cover rounded-lg"></Image>
            </div>
        </div>
    </section>
  )
}

export default WhatSection