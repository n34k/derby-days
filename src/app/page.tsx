'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MainSection from '@/components/MainSection';
import WhatSection from '@/components/WhatSection';

const HomePage = () => {
  return (
    <>
      <MainSection/>
      <WhatSection/>
    </>
  );
};

export default HomePage;
