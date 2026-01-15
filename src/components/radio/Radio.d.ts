import { ReactNode, InputHTMLAttributes, CSSProperties } from 'react';

/**
 * Radio Component Type Definitions
 */

export type RadioColor = 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
export type RadioSize = 'sm' | 'md' | 'lg';
export type RadioVariant = 'simple' | 'card';
export type IconVariant = 'fas' | 'far' | 'fal' | 'fad';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
    // State
    checked?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

    // Configuration
    value?: string | number;
    disabled?: boolean;

    // Appearance
    variant?: RadioVariant;
    color?: RadioColor;
    size?: RadioSize;

    // Label
    label?: string | ReactNode;
    description?: string;

    // Icons
    icon?: string;
    iconVariant?: IconVariant;

    // Styling
    className?: string;
    style?: CSSProperties;
}

export interface RadioGroupProps {
    // Children
    children?: ReactNode;

    // State
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (value: string | number) => void;

    // Configuration
    name?: string;

    // Layout
    orientation?: 'horizontal' | 'vertical';

    // Labels
    label?: string;
    description?: string;
    error?: string;

    // Shared props for children
    size?: RadioSize;
    color?: RadioColor;
    variant?: RadioVariant;
    disabled?: boolean;

    // Styling
    className?: string;
}

interface RadioComponent extends React.FC<RadioProps> {
    Group: React.FC<RadioGroupProps>;
}

declare const Radio: RadioComponent;
export const RadioGroup: React.FC<RadioGroupProps>;
export default Radio;
