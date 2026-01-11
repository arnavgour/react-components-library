import { ReactNode, CSSProperties } from 'react';

/**
 * Select Component Type Definitions
 */

export type SelectTheme = 'default' | 'glass' | 'minimal' | 'outlined' | 'filled';
export type SelectColor = 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
export type SelectSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SelectRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type FocusEffect = 'none' | 'glow' | 'ring' | 'border';
export type IconVariant = 'fas' | 'far' | 'fal' | 'fad';

export interface SelectOption {
    label: string;
    value: string | number;
    icon?: string;
    iconVariant?: IconVariant;
    description?: string;
    disabled?: boolean;
    [key: string]: any;
}

export interface SelectProps {
    // Data
    options?: (string | number | SelectOption)[];
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (value: string | number | null, option?: SelectOption) => void;
    onSearch?: (query: string) => void;

    // Configuration
    searchable?: boolean;
    clearable?: boolean;
    placeholder?: string;
    loading?: boolean;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    id?: string;

    // Appearance
    theme?: SelectTheme;
    color?: SelectColor;
    size?: SelectSize;
    rounded?: SelectRounded;
    fullWidth?: boolean;

    // Label & Help
    label?: string;
    floatingLabel?: boolean;
    helperText?: string;

    // Icons
    leftIcon?: string | ReactNode;
    leftIconVariant?: IconVariant;
    dropdownIcon?: string;
    clearIcon?: string;

    // Select Options
    showSelectOption?: boolean;
    selectOptionText?: string;
    selectOptionValue?: any;

    // Customization
    className?: string;
    labelClassName?: string;
    optionsClassName?: string;
    renderOption?: (option: SelectOption, isSelected: boolean) => ReactNode;
    noOptionsText?: string;
    optionHeight?: string;
    maxDropdownHeight?: string;

    // Animation
    animate?: boolean;
    focusEffect?: FocusEffect;

    // Other
    style?: CSSProperties;
}

declare const Select: React.FC<SelectProps>;
export default Select;
