'use client';
import React, { useState } from 'react'
import Image from "next/image";
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Session } from "next-auth";
import { UserGroupIcon, TrophyIcon, HeartIcon, ClipboardDocumentListIcon, UserIcon } from '@heroicons/react/24/solid';
import SignIn from '@/components/SignIn';

interface Props {
  session: Session | null;
}

const NavBar = ({ session }:Props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 w-full z-50 bg-base border-b-1 backdrop-blur-md shadow-lg">
      <div className="relative">
        <div className="flex justify-between items-center px-5 text-text">
          {/* Logo */}
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <Image src="/images/logo.png" alt="Derby Days" width={70} height={40} priority className="h-20 cursor-pointer transition duration-300 transform hover:scale-110"/>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-20 items-center">
            <Link href="/teams" className="p-3 text-base-content  transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10 rounded-md">Teams</Link>
            <Link href="/standings" className="p-3 text-base-content  transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10 rounded-md">Standings</Link>
            <Link href="/donors" className="p-3 text-base-content  transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10 rounded-md">Donors</Link>
            <Link href="/draft" className="p-3 text-base-content  transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10 rounded-md">Draft</Link>
            {session ? <Link href="/account" className="p-3 text-base-content  transition duration-300 transform hover:scale-110 hover:bg-secondary hover:bg-opacity-10 rounded-md">Account</Link> :
             <SignIn></SignIn>}
          </nav>

          {/* Desktop Button */}
          <Link href="/donate" className="">
            <button className="btn btn-secondary btn-lg p-3 transition duration-300 hover:text-secondary hover:scale-110">Support Us</button>
          </Link>

          {/* Mobile Toggle */}
          <button className="md:hidden z-50" onClick={() => setMenuOpen((prev) => !prev)}>
            {menuOpen
              ? <XMarkIcon className="h-10 w-18 text-base-content" />
              : <Bars3Icon className="h-10 w-18 text-base-content" />}
          </button>
        </div>

        {/* Dropdown Menu */}
        <div
          className={`flex justify-evenly items-center md:hidden w-full bg-primary shadow-lg overflow-hidden
            transition-[max-height] duration-200 ${menuOpen ? 'max-h-[60vh] py-3' : 'max-h-0'} `}
        >
          <Link className='flex flex-col items-center' href="/teams" onClick={() => setMenuOpen(false)}>
            <UserGroupIcon className="h-8 w-8 text-base-content"/>
            <p className='text-base-content font-bold'>Teams</p>
          </Link>
          <Link className='flex flex-col items-center' href="/standings" onClick={() => setMenuOpen(false)}>    
            <TrophyIcon className="h-8 w-8 text-base-content"/>        
            <p className='text-base-content font-bold'>Standings</p>
          </Link>
          <Link className='flex flex-col items-center' href="/donors" onClick={() => setMenuOpen(false)}>
            <HeartIcon className="h-8 w-8 text-base-content"/>
            <p className='text-base-content font-bold'>Donors</p>
          </Link>
          <Link className='flex flex-col items-center' href="/donate" onClick={() => setMenuOpen(false)}>
            <ClipboardDocumentListIcon className="h-8 w-8 text-base-content"/>
            <p className='text-base-content font-bold'>Draft</p>
          </Link>
          {session &&
          <Link className='flex flex-col items-center' href="/account" onClick={() => setMenuOpen(false)}>
            <UserIcon className="h-8 w-8 text-base-content"/>
            <p className='text-base-content font-bold'>Account</p>
          </Link>}
        </div>
      </div>
    </header>
  )
}

export default NavBar