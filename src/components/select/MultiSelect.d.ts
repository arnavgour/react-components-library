import { ReactNode, CSSProperties } from 'react';

/**
 * MultiSelect Component Type Definitions
 */

export type MultiSelectTheme = 'default' | 'glass' | 'minimal' | 'outlined' | 'filled';
export type MultiSelectColor = 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'black';
export type MultiSelectSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type MultiSelectRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ChipDisplay = 'inline' | 'count' | 'compact';
export type FocusEffect = 'none' | 'glow' | 'ring' | 'border';
export type IconVariant = 'fas' | 'far' | 'fal' | 'fad';

export interface MultiSelectOption {
    label: string;
    value: string | number;
    icon?: string;
    iconVariant?: IconVariant;
    description?: string;
    disabled?: boolean;
    [key: string]: any;
}

export interface MultiSelectProps {
    // Data
    options?: (string | number | MultiSelectOption)[];
    value?: (string | number)[];
    defaultValue?: (string | number)[];
    onChange?: (value: (string | number)[], options?: MultiSelectOption[]) => void;
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
    maxSelections?: number;

    // Appearance
    theme?: MultiSelectTheme;
    color?: MultiSelectColor;
    size?: MultiSelectSize;
    rounded?: MultiSelectRounded;
    fullWidth?: boolean;

    // Chip Display
    chipDisplay?: ChipDisplay;
    maxVisibleChips?: number;

    // Label & Help
    label?: string;
    helperText?: string;

    // Icons
    leftIcon?: string | ReactNode;
    leftIconVariant?: IconVariant;
    dropdownIcon?: string;
    clearIcon?: string;

    // Customization
    className?: string;
    labelClassName?: string;
    optionsClassName?: string;
    chipClassName?: string;
    renderOption?: (option: MultiSelectOption, isSelected: boolean) => ReactNode;
    renderChip?: (option: MultiSelectOption, onRemove: () => void) => ReactNode;
    noOptionsText?: string;
    optionHeight?: string;
    maxDropdownHeight?: string;

    // Animation
    animate?: boolean;
    focusEffect?: FocusEffect;

    // Other
    style?: CSSProperties;
}

declare const MultiSelect: React.FC<MultiSelectProps>;
export default MultiSelect;
