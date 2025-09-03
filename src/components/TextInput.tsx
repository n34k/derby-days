import React from "react";

interface Props {
    title: string;
    value: string;
    readOnly: boolean;
    maxLen: number;
    minLen: number;
    onChange: (v: string) => void;
}

const TextInput = ({
    title,
    value,
    readOnly,
    maxLen,
    minLen,
    onChange,
}: Props) => {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-info-content">{title}</label>
            <input
                className="input input-lg"
                readOnly={readOnly}
                placeholder={title}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={maxLen}
                minLength={minLen}
            />
        </div>
    );
};

export default TextInput;
