'use client'
import React, { useState } from 'react'
import Image from 'next/image';

import TextInput from './TextInput'

interface Props {
  initialName: string | null | undefined;
  initialImage: string | null | undefined;
  initialWalkoutSong: string;
}

const UpdateUserForm = ({ initialName, initialImage, initialWalkoutSong }:Props) => {
  const [name, setName] = useState<string | null | undefined>(initialName);
  const [walkoutSong, setWalkoutSong] = useState<string>(initialWalkoutSong);
  const [image, setImage] = useState<string | null | undefined>(initialImage);
  const [editing, setEditing] = useState<boolean>(false)

  const handleSubmit = () => {

  }

  return (
    <form className='bg-primary p-10 rounded-[var(--radius-box)] w-1/2' onSubmit={handleSubmit}>
        <div className='flex gap-20'>
            <Image style={{width: "100px", height: "100px", objectFit: "cover"}} 
                className='rounded-full object-cover' src={image ?? ""} 
                alt='Profile Picture' width={100} height={100}/
            >
            <div className='flex flex-col gap-2.5'>
                <TextInput
                    title='Name'
                    onChange={setName}
                    value={name ?? ""}
                />
                <TextInput
                    title='Walkout Song'
                    onChange={setWalkoutSong}
                    value={walkoutSong}
                />
                <button type='submit'>Submit</button>
            </div>
        </div>
    </form>
  )
}

export default UpdateUserForm