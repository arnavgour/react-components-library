import React, { useState, useRef, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';

/**
 * Input Component - A highly customizable input field with FontAwesome integration
 * 
 * Features:
 * - Multiple themes (default, glass, minimal, outlined, filled, gradient)
 * - Multiple colors (violet, blue, emerald, rose, amber, black)
 * - Multiple sizes (xs, sm, md, lg, xl)
 * - Icon support (left, right, or both)
 * - Prefix/Suffix text support
 * - Floating labels
 * - Character counter
 * - Validation states
 * - Loading state
 * - Copy to clipboard
 * - Password visibility toggle
 * - Clearable input
 * - Animated focus effects
 */

const Input = forwardRef(({
    // Basic props
    type = 'text',
    value,
    defaultValue,
    placeholder = '',
    name,
    id,
    disabled = false,
    readOnly = false,
    required = false,
    autoFocus = false,
    autoComplete = 'off',

    // Appearance
    theme = 'default',
    color = 'violet', // violet, blue, emerald, rose, amber, black
    size = 'md',
    rounded = 'lg',
    fullWidth = false,

    // Label & Help
    label,
    floatingLabel = false,
    helperText,
    errorText,
    successText,

    // Icons - FontAwesome compatible
    leftIcon,
    leftIconVariant = 'fas',
    rightIcon,
    rightIconVariant = 'fas',
    iconColor,

    // Prefix/Suffix
    prefix,
    suffix,

    // Features
    clearable = false,
    showPasswordToggle = false,
    copyable = false,
    showCharCount = false,
    maxLength,

    // States
    isLoading = false,

    // Animation
    animate = true,
    focusEffect = 'glow',

    // Events
    onChange,
    onFocus,
    onBlur,
    onClear,
    onCopy,

    // Custom styling
    className = '',
    inputClassName = '',
    labelClassName = '',
    wrapperClassName = '',
    style,

    // Pass through props
    ...props
}, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);
    const inputRef = useRef(null);

    const actualValue = value !== undefined ? value : internalValue;
    const actualRef = ref || inputRef;

    // Determine input type based on password toggle
    const inputType = type === 'password' && showPassword ? 'text' : type;

    // Color Configuration
    const colorConfig = {
        violet: {
            focus: 'focus-within:border-violet-500 focus-within:ring-violet-500/20',
            label: 'text-violet-600 dark:text-violet-400',
            icon: 'text-violet-500',
            selection: 'bg-violet-500'
        },
        blue: {
            focus: 'focus-within:border-blue-500 focus-within:ring-blue-500/20',
            label: 'text-blue-600 dark:text-blue-400',
            icon: 'text-blue-500',
            selection: 'bg-blue-500'
        },
        emerald: {
            focus: 'focus-within:border-emerald-500 focus-within:ring-emerald-500/20',
            label: 'text-emerald-600 dark:text-emerald-400',
            icon: 'text-emerald-500',
            selection: 'bg-emerald-500'
        },
        rose: {
            focus: 'focus-within:border-rose-500 focus-within:ring-rose-500/20',
            label: 'text-rose-600 dark:text-rose-400',
            icon: 'text-rose-500',
            selection: 'bg-rose-500'
        },
        amber: {
            focus: 'focus-within:border-amber-500 focus-within:ring-amber-500/20',
            label: 'text-amber-600 dark:text-amber-400',
            icon: 'text-amber-500',
            selection: 'bg-amber-500'
        },
        black: {
            focus: 'focus-within:border-slate-800 dark:focus-within:border-slate-200 focus-within:ring-slate-500/20',
            label: 'text-slate-800 dark:text-slate-200',
            icon: 'text-slate-800 dark:text-slate-200',
            selection: 'bg-slate-800'
        }
    };

    const colors = colorConfig[color] || colorConfig.violet;

    // Size configurations
    const sizeConfig = {
        xs: {
            input: 'h-7 text-xs px-2',
            icon: 'text-xs',
            label: 'text-xs',
            iconPadding: { left: 'pl-7', right: 'pr-7' }
        },
        sm: {
            input: 'h-8 text-xs px-3',
            icon: 'text-xs',
            label: 'text-xs',
            iconPadding: { left: 'pl-8', right: 'pr-8' }
        },
        md: {
            input: 'h-10 text-sm px-4',
            icon: 'text-sm',
            label: 'text-sm',
            iconPadding: { left: 'pl-10', right: 'pr-10' }
        },
        lg: {
            input: 'h-12 text-base px-5',
            icon: 'text-base',
            label: 'text-base',
            iconPadding: { left: 'pl-12', right: 'pr-12' }
        },
        xl: {
            input: 'h-14 text-lg px-6',
            icon: 'text-lg',
            label: 'text-lg',
            iconPadding: { left: 'pl-14', right: 'pr-14' }
        }
    };

    // Rounded configurations
    const roundedConfig = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        full: 'rounded-full'
    };

    // Theme configurations
    const themeConfig = {
        default: {
            wrapper: 'bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 shadow-sm',
            input: 'bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:text-sm',
            focus: 'focus-within:ring-1 focus-within:bg-white dark:focus-within:bg-slate-950',
            icon: 'text-slate-400 dark:text-slate-500',
            disabled: 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900'
        },
        glass: {
            wrapper: 'bg-white/60 dark:bg-slate-800/30 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/30 shadow-sm',
            input: 'bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400/50 placeholder:text-sm',
            focus: 'focus-within:ring-1 focus-within:bg-white/80 dark:focus-within:bg-slate-800/40',
            icon: 'text-slate-400 dark:text-slate-400/70',
            disabled: 'opacity-40 cursor-not-allowed'
        },
        minimal: {
            wrapper: 'bg-transparent border-b-2 border-slate-200 dark:border-slate-700 rounded-none',
            input: 'bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:text-sm',
            focus: '',
            icon: 'text-slate-400 dark:text-slate-500',
            disabled: 'opacity-50 cursor-not-allowed'
        },
        outlined: {
            wrapper: 'bg-transparent border-2 border-slate-300 dark:border-slate-600',
            input: 'bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:text-sm',
            focus: 'focus-within:ring-2',
            icon: 'text-slate-400 dark:text-slate-500',
            disabled: 'opacity-50 cursor-not-allowed'
        },
        filled: {
            wrapper: 'bg-slate-100 dark:bg-slate-800 border-2 border-transparent',
            input: 'bg-transparent text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 placeholder:text-sm',
            focus: 'focus-within:bg-white dark:focus-within:bg-slate-700 focus-within:ring-1',
            icon: 'text-slate-500 dark:text-slate-400',
            disabled: 'opacity-50 cursor-not-allowed bg-slate-200 dark:bg-slate-900'
        },
        gradient: {
            wrapper: 'bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50 border border-slate-200/50 dark:border-slate-600/30 backdrop-blur-sm',
            input: 'bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 placeholder:text-sm',
            focus: 'focus-within:ring-1',
            icon: 'text-slate-500 dark:text-slate-400',
            disabled: 'opacity-50 cursor-not-allowed'
        }
    };

    // Focus effect configurations
    const focusEffectConfig = {
        none: '',
        glow: 'transition-shadow duration-300',
        scale: 'transition-transform duration-200 focus-within:scale-[1.02]',
        lift: 'transition-all duration-200 focus-within:-translate-y-0.5 focus-within:shadow-lg'
    };

    // Handle change
    const handleChange = (e) => {
        const newValue = e.target.value;
        if (value === undefined) {
            setInternalValue(newValue);
        }
        onChange?.(e);
    };

    // Handle focus
    const handleFocus = (e) => {
        setIsFocused(true);
        onFocus?.(e);
    };

    // Handle blur
    const handleBlur = (e) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    // Handle clear
    const handleClear = () => {
        if (value === undefined) {
            setInternalValue('');
        }
        onClear?.();
        actualRef.current?.focus();
    };

    // Handle copy
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(actualValue);
            setCopied(true);
            onCopy?.(actualValue);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Determine if we need extra padding for icons/buttons
    const hasLeftContent = leftIcon || prefix || isLoading;
    const hasRightContent = rightIcon || suffix || clearable || showPasswordToggle || copyable;

    const currentSize = sizeConfig[size] || sizeConfig.md;
    const currentTheme = themeConfig[theme] || themeConfig.default;
    const currentRounded = roundedConfig[rounded] || roundedConfig.lg;
    const currentFocusEffect = focusEffectConfig[focusEffect] || '';

    // Calculate right padding based on number of right elements
    const rightButtonCount = [clearable && actualValue, showPasswordToggle && type === 'password', copyable].filter(Boolean).length;
    const rightPadding = rightButtonCount > 0 ? `pr-${8 + (rightButtonCount * 8)}` : rightIcon ? currentSize.iconPadding.right : '';

    return (
        <div className={`${fullWidth ? 'w-full' : 'inline-flex flex-col'} ${wrapperClassName}`}>
            {/* Label */}
            {label && !floatingLabel && (
                <label
                    htmlFor={id || name}
                    className={`block mb-1.5 font-medium text-slate-700 dark:text-slate-300 ${currentSize.label} ${labelClassName}`}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Input wrapper */}
            <div
                className={`
          relative flex items-center
          ${currentTheme.wrapper}
          ${currentRounded}
          ${currentTheme.focus}
          ${colors.focus}
          ${disabled ? currentTheme.disabled : ''}
          ${animate ? currentFocusEffect : ''}
          ${className}
        `}
                style={style}
            >
                {/* Floating label */}
                {label && floatingLabel && (
                    <label
                        htmlFor={id || name}
                        className={`
              absolute left-4 transition-all duration-200 pointer-events-none
              ${isFocused || actualValue
                                ? `-top-2.5 text-xs px-1 bg-white dark:bg-slate-800 ${colors.label}`
                                : `top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 ${currentSize.label}`
                            }
              ${labelClassName}
            `}
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                {/* Prefix */}
                {prefix && (
                    <span className={`flex-shrink-0 pl-3 text-slate-500 dark:text-slate-400 ${currentSize.icon}`}>
                        {prefix}
                    </span>
                )}

                {/* Left icon */}
                {leftIcon && (
                    <span className={`absolute left-3 flex items-center justify-center ${iconColor || currentTheme.icon} ${currentSize.icon}`}>
                        {typeof leftIcon === 'string' ? (
                            <Icon icon={leftIcon} variant={leftIconVariant} />
                        ) : (
                            leftIcon
                        )}
                    </span>
                )}

                {/* Loading spinner */}
                {isLoading && !leftIcon && (
                    <span className={`absolute left-3 flex items-center justify-center ${currentTheme.icon} ${currentSize.icon}`}>
                        <Icon icon="spinner-third" variant="fad" className="animate-spin" />
                    </span>
                )}

                {/* Input field */}
                <input
                    ref={actualRef}
                    type={inputType}
                    id={id || name}
                    name={name}
                    value={actualValue}
                    placeholder={floatingLabel && !isFocused ? '' : placeholder}
                    disabled={disabled || isLoading}
                    readOnly={readOnly}
                    required={required}
                    autoFocus={autoFocus}
                    autoComplete={autoComplete}
                    maxLength={maxLength}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={`
            w-full outline-none
            ${currentTheme.input}
            ${currentSize.input}
            ${hasLeftContent ? currentSize.iconPadding.left : ''}
            ${hasRightContent ? rightPadding : ''}
            ${prefix ? 'pl-1' : ''}
            ${suffix ? 'pr-1' : ''}
            ${inputClassName}
          `}
                    {...props}
                />

                {/* Right side buttons container */}
                <div className="absolute right-2 flex items-center gap-1">
                    {/* Clear button */}
                    {clearable && actualValue && !disabled && !readOnly && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className={`p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${currentTheme.icon} ${currentSize.icon}`}
                            tabIndex={-1}
                        >
                            <Icon icon="xmark" variant="fas" />
                        </button>
                    )}

                    {/* Password toggle */}
                    {showPasswordToggle && type === 'password' && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${currentTheme.icon} ${currentSize.icon}`}
                            tabIndex={-1}
                        >
                            <Icon icon={showPassword ? 'eye-slash' : 'eye'} variant="fas" />
                        </button>
                    )}

                    {/* Copy button */}
                    {copyable && (
                        <button
                            type="button"
                            onClick={handleCopy}
                            className={`p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${copied ? 'text-emerald-500' : currentTheme.icon} ${currentSize.icon}`}
                            tabIndex={-1}
                        >
                            <Icon icon={copied ? 'check' : 'copy'} variant="fas" />
                        </button>
                    )}
                </div>

                {/* Right icon */}
                {rightIcon && !clearable && !showPasswordToggle && !copyable && (
                    <span className={`absolute right-3 flex items-center justify-center ${iconColor || currentTheme.icon} ${currentSize.icon}`}>
                        {typeof rightIcon === 'string' ? (
                            <Icon icon={rightIcon} variant={rightIconVariant} />
                        ) : (
                            rightIcon
                        )}
                    </span>
                )}

                {/* Suffix */}
                {suffix && (
                    <span className={`flex-shrink-0 pr-3 text-slate-500 dark:text-slate-400 ${currentSize.icon}`}>
                        {suffix}
                    </span>
                )}
            </div>

            {/* Bottom section: helper text and character count */}
            <div className="flex justify-between items-start mt-1.5">
                <div className="flex-1">
                    {/* Helper text */}
                    {helperText && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {helperText}
                        </p>
                    )}
                </div>

                {/* Character count */}
                {showCharCount && maxLength && (
                    <span className={`text-xs ${actualValue.length >= maxLength ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                        {actualValue.length}/{maxLength}
                    </span>
                )}
            </div>
        </div>
    );
});

Input.displayName = 'Input';

Input.propTypes = {
    // Basic
    type: PropTypes.oneOf(['text', 'password', 'email', 'number', 'tel', 'url', 'search', 'date', 'time', 'datetime-local']),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    placeholder: PropTypes.string,
    name: PropTypes.string,
    id: PropTypes.string,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    required: PropTypes.bool,
    autoFocus: PropTypes.bool,
    autoComplete: PropTypes.string,

    // Appearance
    theme: PropTypes.oneOf(['default', 'glass', 'minimal', 'outlined', 'filled', 'gradient']),
    color: PropTypes.oneOf(['violet', 'blue', 'emerald', 'rose', 'amber', 'black']),
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    rounded: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full']),
    fullWidth: PropTypes.bool,

    // Label & Help
    label: PropTypes.string,
    floatingLabel: PropTypes.bool,
    helperText: PropTypes.string,

    // Icons
    leftIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    leftIconVariant: PropTypes.oneOf(['fas', 'far', 'fal', 'fad']),
    rightIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    rightIconVariant: PropTypes.oneOf(['fas', 'far', 'fal', 'fad']),
    iconColor: PropTypes.string,

    // Prefix/Suffix
    prefix: PropTypes.node,
    suffix: PropTypes.node,

    // Features
    clearable: PropTypes.bool,
    showPasswordToggle: PropTypes.bool,
    copyable: PropTypes.bool,
    showCharCount: PropTypes.bool,
    maxLength: PropTypes.number,

    // States
    isLoading: PropTypes.bool,

    // Animation
    animate: PropTypes.bool,
    focusEffect: PropTypes.oneOf(['none', 'glow', 'scale', 'lift']),

    // Events
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onClear: PropTypes.func,
    onCopy: PropTypes.func,

    // Styling
    className: PropTypes.string,
    inputClassName: PropTypes.string,
    labelClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    style: PropTypes.object,
};

export default Input;
