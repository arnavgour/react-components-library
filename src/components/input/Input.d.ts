import { ReactNode, InputHTMLAttributes, CSSProperties } from 'react';

/**
 * Input Component Type Definitions
 * 
 * A highly customizable input component with FontAwesome integration,
 * multiple themes, colors, sizes, and interactive effects.
 */

/** Available input types */
export type InputType =
    | 'text'
    | 'password'
    | 'email'
    | 'number'
    | 'tel'
    | 'url'
    | 'search'
    | 'date'
    | 'time'
    | 'datetime-local';

/** 
 * Theme configurations for visual appearance
 */
export type InputTheme =
    | 'default'
    | 'glass'
    | 'minimal'
    | 'outlined'
    | 'filled'
    | 'gradient';

/**
 * Color themes for accents and focus states
 */
export type InputColor =
    | 'violet'
    | 'blue'
    | 'emerald'
    | 'rose'
    | 'amber'
    | 'black';

/**
 * Size presets
 */
export type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Border radius presets
 */
export type InputRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

/**
 * FontAwesome icon variant types
 */
export type IconVariant = 'fas' | 'far' | 'fal' | 'fad';

/**
 * Focus animation effects
 */
export type FocusEffect = 'none' | 'glow' | 'scale' | 'lift';

/**
 * Input Component Props Interface
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'prefix' | 'onCopy'> {
    // Basic Props
    type?: InputType;
    value?: string | number;
    defaultValue?: string | number;
    placeholder?: string;
    name?: string;
    id?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    autoFocus?: boolean;
    autoComplete?: string;

    // Appearance
    theme?: InputTheme;
    color?: InputColor;
    size?: InputSize;
    rounded?: InputRounded;
    fullWidth?: boolean;

    // Label & Help Text
    label?: string;
    floatingLabel?: boolean;
    helperText?: string;
    errorText?: string;
    successText?: string;

    // Icons - FontAwesome Compatible
    leftIcon?: string | ReactNode;
    leftIconVariant?: IconVariant;
    rightIcon?: string | ReactNode;
    rightIconVariant?: IconVariant;
    iconColor?: string;

    // Prefix / Suffix
    prefix?: ReactNode;
    suffix?: ReactNode;

    // Features
    clearable?: boolean;
    showPasswordToggle?: boolean;
    copyable?: boolean;
    showCharCount?: boolean;
    maxLength?: number;

    // States
    isLoading?: boolean;

    // Animation
    animate?: boolean;
    focusEffect?: FocusEffect;

    // Events
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onClear?: () => void;
    onCopy?: (value: string) => void;

    // Styling
    className?: string;
    inputClassName?: string;
    labelClassName?: string;
    wrapperClassName?: string;
    style?: CSSProperties;
}

declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;

export default Input;
