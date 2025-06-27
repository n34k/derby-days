'use client';
import React, { useState } from 'react'
import Image from "next/image";
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { UserGroupIcon, TrophyIcon, HeartIcon, CurrencyDollarIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/solid';


const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 w-full z-50 bg-primary shadow-lg">
      <div className="relative">
        <div className="flex justify-between items-center px-5 py-3 text-text">
          {/* Logo */}
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <Image src="/images/logo.png" alt="Derby Days" width={70} height={40} className="h-20 cursor-pointer transition duration-300 transform hover:scale-110"/>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-20 items-center">
            <Link href="/teams" className="p-3 text-primary-content  transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10 rounded-md">Teams</Link>
            <Link href="/standings" className="p-3 text-primary-content  transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10 rounded-md">Standings</Link>
            <Link href="/donors" className="p-3 text-primary-content  transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10 rounded-md">Donors</Link>
          </nav>

          {/* Desktop Button */}
          <Link href="/donate" className="">
            <button className="btn btn-secondary btn-lg p-3 transition duration-300 hover:text-secondary hover:scale-110">Donate Here</button>
          </Link>

          {/* Mobile Toggle */}
          <button className="md:hidden z-50" onClick={() => setMenuOpen((prev) => !prev)}>
            {menuOpen
              ? <XMarkIcon className="h-10 w-18 text-primary-content" />
              : <Bars3Icon className="h-10 w-18 text-primary-content" />}
          </button>
        </div>

        {/* Dropdown Menu */}
        <div
          className={`flex justify-evenly items-center md:hidden w-full bg-accent shadow-lg overflow-hidden
          ${menuOpen ? 'max-h-[60vh] py-3' : 'max-h-0'} `}
        >
          <Link className='flex flex-col items-center' href="/teams" onClick={() => setMenuOpen(false)}>
            <UserGroupIcon className="h-8 w-8 text-primary-content"/>
            <p className='text-primary-content font-bold'>Teams</p>
          </Link>
          <Link className='flex flex-col items-center' href="/standings" onClick={() => setMenuOpen(false)}>    
            <TrophyIcon className="h-8 w-8 text-primary-content"/>        
            <p className='text-primary-content font-bold'>Standings</p>
          </Link>
          <Link className='flex flex-col items-center' href="/donors" onClick={() => setMenuOpen(false)}>
            <HeartIcon className="h-8 w-8 text-primary-content"/>
            <p className='text-primary-content font-bold'>Donors</p>
          </Link>
          <Link className='flex flex-col items-center' href="/donate" onClick={() => setMenuOpen(false)}>
            <ClipboardDocumentListIcon className="h-8 w-8 text-primary-content"/>
            <p className='text-primary-content font-bold'>Draft</p>
          </Link>
        </div>
      </div>
    </header>
  )
}

export default NavBar