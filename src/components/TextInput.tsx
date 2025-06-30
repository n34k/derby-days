import React from 'react'

interface Props {
    title: string;
    value: string;
    onChange: (v:string) => void;
}

const TextInput = ({title, value, onChange}:Props) => {
  return (
    <div className='flex flex-col'>
        <label>{title}</label>
        <input className='border-1 rounded-[var(--radius-field)] p-1'
            placeholder={title}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
  )
}

export default TextInput