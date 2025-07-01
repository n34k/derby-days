import React from 'react';

export default function Footer() {
    return (
        <div>
            <div className='flex justify-center w-screen shadow-lg bg-base z-50 items-center border-t-1 p-5'>
                 <p className='text-subText'>&copy; {new Date().getFullYear()} Nick Davis. All rights reserved.</p>
            </div>
        </div>
    );
}