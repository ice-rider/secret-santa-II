import { Button as SuidButton } from '@suid/material';
import { JSX } from 'solid-js';

interface ButtonProps {
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  children: JSX.Element;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  [key: string]: any;
}

const Button = (props: ButtonProps) => {
  const { variant = 'contained', color = 'primary', size = 'medium', children, ...rest } = props;

  return (
    <SuidButton
      variant={variant}
      color={color}
      size={size}
      disabled={props.disabled}
      type={props.type}
      fullWidth={props.fullWidth}
      {...rest}
    >
      {children}
    </SuidButton>
  );
};

export { Button };