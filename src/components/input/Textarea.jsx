import React, { useState, useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';

/**
 * Textarea Component - A highly customizable textarea field matching Input styling
 * 
 * Features:
 * - Multiple themes (default, glass, minimal, outlined, filled, gradient)
 * - Multiple colors (violet, blue, emerald, rose, amber, black)
 * - Multiple sizes (xs, sm, md, lg, xl)
 * - Floating labels
 * - Character counter
 * - Validation states
 * - Animated focus effects
 */

const Textarea = forwardRef(({
    // Basic props
    value,
    defaultValue,
    placeholder = '',
    name,
    id,
    disabled = false,
    readOnly = false,
    required = false,
    autoFocus = false,
    rows = 4,
    maxLength,

    // Appearance
    theme = 'default',
    color = 'violet', // violet, blue, emerald, rose, amber, black
    size = 'md',
    rounded = 'xl',
    fullWidth = true,

    // Label & Help
    label,
    floatingLabel = false,
    helperText,

    // Animation
    animate = true,
    focusEffect = 'glow',

    // Events
    onChange,
    onFocus,
    onBlur,

    // Custom styling
    className = '',
    textareaClassName = '',
    labelClassName = '',
    wrapperClassName = '',
    style,

    // Pass through props
    ...props
}, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef(null);

    const actualValue = value !== undefined ? value : internalValue;
    const actualRef = ref || textareaRef;

    // Color Configuration (matching Input)
    const colorConfig = {
        violet: {
            focus: 'focus-within:border-violet-500 focus-within:ring-violet-500/20',
            label: 'text-violet-600 dark:text-violet-400',
        },
        blue: {
            focus: 'focus-within:border-blue-500 focus-within:ring-blue-500/20',
            label: 'text-blue-600 dark:text-blue-400',
        },
        emerald: {
            focus: 'focus-within:border-emerald-500 focus-within:ring-emerald-500/20',
            label: 'text-emerald-600 dark:text-emerald-400',
        },
        rose: {
            focus: 'focus-within:border-rose-500 focus-within:ring-rose-500/20',
            label: 'text-rose-600 dark:text-rose-400',
        },
        amber: {
            focus: 'focus-within:border-amber-500 focus-within:ring-amber-500/20',
            label: 'text-amber-600 dark:text-amber-400',
        },
        black: {
            focus: 'focus-within:border-slate-800 dark:focus-within:border-slate-200 focus-within:ring-slate-500/20',
            label: 'text-slate-800 dark:text-slate-200',
        }
    };

    const colors = colorConfig[color] || colorConfig.violet;

    // Size configurations (matching Input)
    const sizeConfig = {
        xs: {
            textarea: 'text-xs px-2 py-1.5',
            label: 'text-xs',
        },
        sm: {
            textarea: 'text-xs px-3 py-2',
            label: 'text-xs',
        },
        md: {
            textarea: 'text-sm px-4 py-3',
            label: 'text-sm',
        },
        lg: {
            textarea: 'text-base px-5 py-4',
            label: 'text-base',
        },
        xl: {
            textarea: 'text-lg px-6 py-5',
            label: 'text-lg',
        }
    };

    // Rounded configurations (matching Input)
    const roundedConfig = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        full: 'rounded-3xl' // Using 3xl for textarea as full would look odd
    };

    // Theme configurations (matching Input)
    const themeConfig = {
        default: {
            wrapper: 'bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 shadow-sm',
            textarea: 'bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500',
            focus: 'focus-within:ring-1 focus-within:bg-white dark:focus-within:bg-slate-950',
            disabled: 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900'
        },
        glass: {
            wrapper: 'bg-white/60 dark:bg-slate-800/30 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/30 shadow-sm',
            textarea: 'bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400/50',
            focus: 'focus-within:ring-1 focus-within:bg-white/80 dark:focus-within:bg-slate-800/40',
            disabled: 'opacity-40 cursor-not-allowed'
        },
        minimal: {
            wrapper: 'bg-transparent border-b-2 border-slate-200 dark:border-slate-700 rounded-none',
            textarea: 'bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500',
            focus: '',
            disabled: 'opacity-50 cursor-not-allowed'
        },
        outlined: {
            wrapper: 'bg-transparent border-2 border-slate-300 dark:border-slate-600',
            textarea: 'bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500',
            focus: 'focus-within:ring-2',
            disabled: 'opacity-50 cursor-not-allowed'
        },
        filled: {
            wrapper: 'bg-slate-100 dark:bg-slate-800 border-2 border-transparent',
            textarea: 'bg-transparent text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400',
            focus: 'focus-within:bg-white dark:focus-within:bg-slate-700 focus-within:ring-1',
            disabled: 'opacity-50 cursor-not-allowed bg-slate-200 dark:bg-slate-900'
        },
        gradient: {
            wrapper: 'bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50 border border-slate-200/50 dark:border-slate-600/30 backdrop-blur-sm',
            textarea: 'bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400',
            focus: 'focus-within:ring-1',
            disabled: 'opacity-50 cursor-not-allowed'
        }
    };

    // Focus effect configurations (matching Input)
    const focusEffectConfig = {
        none: '',
        glow: 'transition-shadow duration-300',
        scale: 'transition-transform duration-200 focus-within:scale-[1.01]',
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

    const currentSize = sizeConfig[size] || sizeConfig.md;
    const currentTheme = themeConfig[theme] || themeConfig.default;
    const currentRounded = roundedConfig[rounded] || roundedConfig.xl;
    const currentFocusEffect = focusEffectConfig[focusEffect] || '';

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

            {/* Textarea wrapper */}
            <div
                className={`
                    relative
                    ${theme === 'minimal' ? '' : currentRounded}
                    ${currentTheme.wrapper}
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
                            absolute left-4 transition-all duration-200 pointer-events-none z-10
                            ${isFocused || actualValue
                                ? `-top-2.5 text-xs px-1 bg-white dark:bg-slate-800 ${colors.label}`
                                : `top-3 text-slate-400 dark:text-slate-500 ${currentSize.label}`
                            }
                            ${labelClassName}
                        `}
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                {/* Textarea field */}
                <textarea
                    ref={actualRef}
                    id={id || name}
                    name={name}
                    value={actualValue}
                    placeholder={floatingLabel && !isFocused ? '' : placeholder}
                    disabled={disabled}
                    readOnly={readOnly}
                    required={required}
                    autoFocus={autoFocus}
                    maxLength={maxLength}
                    rows={rows}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={`
                        w-full outline-none resize-y min-h-[80px]
                        ${currentTheme.textarea}
                        ${currentSize.textarea}
                        ${theme === 'minimal' ? '' : currentRounded}
                        ${textareaClassName}
                    `}
                    {...props}
                />

                {/* Character count */}
                {maxLength && !disabled && (
                    <div className="absolute bottom-2 right-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 ${actualValue.length >= maxLength ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'
                            }`}>
                            {actualValue.length}/{maxLength}
                        </span>
                    </div>
                )}
            </div>

            {/* Bottom section: helper text */}
            {helperText && (
                <div className="flex items-start gap-1.5 mt-1.5 px-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        {helperText}
                    </span>
                </div>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';

Textarea.propTypes = {
    // Basic
    value: PropTypes.string,
    defaultValue: PropTypes.string,
    placeholder: PropTypes.string,
    name: PropTypes.string,
    id: PropTypes.string,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    required: PropTypes.bool,
    autoFocus: PropTypes.bool,
    rows: PropTypes.number,
    maxLength: PropTypes.number,

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

    // Animation
    animate: PropTypes.bool,
    focusEffect: PropTypes.oneOf(['none', 'glow', 'scale', 'lift']),

    // Events
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,

    // Styling
    className: PropTypes.string,
    textareaClassName: PropTypes.string,
    labelClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    style: PropTypes.object,
};

export default Textarea;
