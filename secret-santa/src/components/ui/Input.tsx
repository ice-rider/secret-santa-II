import { TextField } from "@suid/material";
import type { Component } from "solid-js";

interface InputProps {
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  type?: string;
  value?: string;
  onInput?: (e: any) => void;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  [key: string]: any;
}

const Input: Component<InputProps> = (props) => {
  const { label, placeholder, error, helperText, fullWidth = true, variant = 'outlined', ...rest } = props;

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      variant={variant}
      fullWidth={fullWidth}
      {...rest}
    />
  );
};

export { Input };