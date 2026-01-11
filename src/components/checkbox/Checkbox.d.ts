import { ReactNode, InputHTMLAttributes, CSSProperties } from 'react';

/**
 * Checkbox Component Type Definitions
 */

export type CheckboxColor = 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
export type CheckboxSize = 'sm' | 'md' | 'lg';
export type CheckboxVariant = 'default' | 'card' | 'switch';
export type IconVariant = 'fas' | 'far' | 'fal' | 'fad';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
    // State
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;

    // Configuration
    name?: string;
    value?: string | number;
    disabled?: boolean;
    required?: boolean;

    // Appearance
    variant?: CheckboxVariant;
    color?: CheckboxColor;
    size?: CheckboxSize;

    // Label
    label?: string | ReactNode;
    description?: string;
    labelPosition?: 'left' | 'right';

    // Icons
    icon?: string;
    iconVariant?: IconVariant;
    checkedIcon?: string;
    uncheckedIcon?: string;

    // Styling
    className?: string;
    labelClassName?: string;
    style?: CSSProperties;
}

declare const Checkbox: React.FC<CheckboxProps>;
export default Checkbox;
