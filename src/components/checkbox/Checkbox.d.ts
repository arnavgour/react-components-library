import { ReactNode, InputHTMLAttributes, CSSProperties } from 'react';

/**
 * Checkbox Component Type Definitions
 */

export type CheckboxColor = 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
export type CheckboxSize = 'sm' | 'md' | 'lg';
export type CheckboxVariant = 'simple' | 'card';
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

    // Icons
    icon?: string;
    iconVariant?: IconVariant;

    // Styling
    className?: string;
    style?: CSSProperties;
}

export interface CheckboxGroupProps {
    // Children
    children?: ReactNode;

    // State
    value?: (string | number)[];
    defaultValue?: (string | number)[];
    onChange?: (values: (string | number)[]) => void;

    // Layout
    orientation?: 'horizontal' | 'vertical';

    // Labels
    label?: string;
    description?: string;
    error?: string;

    // Shared props for children
    size?: CheckboxSize;
    color?: CheckboxColor;
    variant?: CheckboxVariant;
    disabled?: boolean;

    // Styling
    className?: string;
}

interface CheckboxComponent extends React.FC<CheckboxProps> {
    Group: React.FC<CheckboxGroupProps>;
}

declare const Checkbox: CheckboxComponent;
export const CheckboxGroup: React.FC<CheckboxGroupProps>;
export default Checkbox;
