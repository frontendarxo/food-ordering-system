import React from "react";

interface FieldProps {
    label?: string;
    type: string;
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Field: React.FC<FieldProps> = ({ label, type, id, value, onChange }) => {
    return (
        <label htmlFor={id}>
            <span>{label}</span>
            <input type={type} id={id} value={value} onChange={onChange} placeholder={label} />
        </label>
    )
}