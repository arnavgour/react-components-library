import { ReactNode, InputHTMLAttributes, CSSProperties } from 'react';

/**
 * Radio Component Type Definitions
 */

export type RadioColor = 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
export type RadioSize = 'sm' | 'md' | 'lg';
export type RadioVariant = 'default' | 'card' | 'button';
export type IconVariant = 'fas' | 'far' | 'fal' | 'fad';

export interface RadioOption {
    label: string;
    value: string | number;
    description?: string;
    icon?: string;
    iconVariant?: IconVariant;
    disabled?: boolean;
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
    // Data
    options?: RadioOption[];
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (value: string | number, option?: RadioOption) => void;

    // Configuration
    name: string;
    disabled?: boolean;
    required?: boolean;

    // Appearance
    variant?: RadioVariant;
    color?: RadioColor;
    size?: RadioSize;
    orientation?: 'horizontal' | 'vertical';

    // Label
    label?: string;
    helperText?: string;

    // Styling
    className?: string;
    optionClassName?: string;
    labelClassName?: string;
    style?: CSSProperties;
}

declare const Radio: React.FC<RadioProps>;
export default Radio;
