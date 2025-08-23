import React from "react";

type SortByProps<T extends string | number> = {
    options: readonly T[];
    value: T;
    handleChange: (val: T) => void;
};

function SortBy<T extends string | number>({
    options,
    handleChange,
    value,
}: SortByProps<T>) {
    return (
        <select
            className="select select-md text-center"
            onChange={(e) => handleChange(e.target.value as T)}
            value={value}
        >
            {options.map((o) => (
                <option key={o} value={o}>
                    {o}
                </option>
            ))}
        </select>
    );
}

export default SortBy;
