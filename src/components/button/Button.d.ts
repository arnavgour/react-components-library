import { ReactNode, ButtonHTMLAttributes, CSSProperties } from 'react';

/**
 * Button Component Type Definitions
 */

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'soft' | 'link';
export type ButtonColor = 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type IconVariant = 'fas' | 'far' | 'fal' | 'fad';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
    // Content
    children?: ReactNode;

    // Appearance
    variant?: ButtonVariant;
    color?: ButtonColor;
    size?: ButtonSize;
    rounded?: ButtonRounded;
    fullWidth?: boolean;

    // Icons
    leftIcon?: string | ReactNode;
    rightIcon?: string | ReactNode;
    iconVariant?: IconVariant;
    iconOnly?: boolean;

    // States
    loading?: boolean;
    loadingText?: string;
    disabled?: boolean;

    // Animation
    animate?: boolean;

    // Styling
    className?: string;
    style?: CSSProperties;
}

declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export default Button;
