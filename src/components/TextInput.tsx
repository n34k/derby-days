import React from "react";

interface Props {
  title: string;
  value: string;
  readOnly: boolean;
  onChange: (v: string) => void;
}

const TextInput = ({ title, value, readOnly, onChange }: Props) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-info-content">{title}</label>
      <input
        className="input input-lg"
        readOnly={readOnly}
        placeholder={title}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default TextInput;
