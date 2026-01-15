import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';

const RadioContext = createContext(null);

/**
 * RadioGroup Component - Manages state for a group of Radio buttons
 */
export const RadioGroup = ({
    children,
    value,
    defaultValue,
    onChange,
    name,
    orientation = 'vertical',
    label,
    description,
    error,
    className = '',
    // Shared props for children
    size = 'md',
    color = 'violet',
    variant = 'simple', // simple, card
    disabled = false
}) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = value !== undefined;
    const actualValue = isControlled ? value : internalValue;

    const handleChange = (newValue) => {
        if (!isControlled) {
            setInternalValue(newValue);
        }
        onChange?.(newValue);
    };

    return (
        <RadioContext.Provider value={{
            name,
            value: actualValue,
            onChange: handleChange,
            size,
            color,
            variant,
            disabledGrp: disabled
        }}>
            <div className={`flex flex-col gap-2 ${className}`}>
                {/* Group Label */}
                {label && (
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {label}
                    </label>
                )}

                {/* Description */}
                {description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1 mb-1">
                        {description}
                    </p>
                )}

                {/* Options Container */}
                <div className={`
                    flex gap-3
                    ${orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'}
                `}>
                    {children}
                </div>

                {/* Error Message */}
                {error && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <Icon icon="circle-exclamation" />
                        {error}
                    </p>
                )}
            </div>
        </RadioContext.Provider>
    );
};

// Colors for the radio circle/border
const colorConfig = {
    violet: {
        checked: 'border-violet-500',
        dot: 'bg-violet-500',
        ring: 'focus:ring-violet-500',
        text: 'text-violet-700 dark:text-violet-300',
        bg: 'bg-violet-50 dark:bg-violet-900/20',
        border: 'border-violet-500/50'
    },
    blue: {
        checked: 'border-blue-500',
        dot: 'bg-blue-500',
        ring: 'focus:ring-blue-500',
        text: 'text-blue-700 dark:text-blue-300',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-500/50'
    },
    emerald: {
        checked: 'border-emerald-500',
        dot: 'bg-emerald-500',
        ring: 'focus:ring-emerald-500',
        text: 'text-emerald-700 dark:text-emerald-300',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-500/50'
    },
    rose: {
        checked: 'border-rose-500',
        dot: 'bg-rose-500',
        ring: 'focus:ring-rose-500',
        text: 'text-rose-700 dark:text-rose-300',
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        border: 'border-rose-500/50'
    },
    amber: {
        checked: 'border-amber-500',
        dot: 'bg-amber-500',
        ring: 'focus:ring-amber-500',
        text: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-500/50'
    },
    black: {
        checked: 'border-slate-900 dark:border-white',
        dot: 'bg-slate-900 dark:bg-white',
        ring: 'focus:ring-slate-500',
        text: 'text-slate-900 dark:text-white',
        bg: 'bg-slate-100 dark:bg-slate-800',
        border: 'border-slate-900/50 dark:border-white/50'
    }
};

/**
 * Radio Component - Individual radio button
 */
const Radio = ({
    value,
    label,
    description,
    icon,
    disabled = false,
    className = '',
    style,
    // Direct props (override context)
    checked,
    onChange, // only for standalone
    size,
    color,
    variant
}) => {
    const context = useContext(RadioContext);

    // Resolve props (context vs direct)
    const isGrouped = context !== null;
    const finalName = isGrouped ? context.name : undefined;
    const finalSize = size || (context?.size || 'md');
    const finalColor = color || (context?.color || 'violet');
    const finalVariant = variant || (context?.variant || 'simple');
    const finalDisabled = disabled || (context?.disabledGrp || false);

    // Checked state calculation
    const isChecked = isGrouped
        ? context.value === value
        : checked;

    const handleChange = (e) => {
        if (finalDisabled) return;
        if (isGrouped) {
            context.onChange(value);
        } else {
            onChange?.(e);
        }
    };

    const colors = colorConfig[finalColor] || colorConfig.violet;

    // Size logic
    const sizeClasses = {
        sm: { circle: 'w-4 h-4', dot: 'w-2 h-2', text: 'text-xs', p: 'p-3' },
        md: { circle: 'w-5 h-5', dot: 'w-2.5 h-2.5', text: 'text-sm', p: 'p-4' },
        lg: { circle: 'w-6 h-6', dot: 'w-3 h-3', text: 'text-base', p: 'p-5' }
    }[finalSize];

    // Card Variant Logic
    if (finalVariant === 'card') {
        return (
            <label
                className={`
                    relative flex items-start gap-4 cursor-pointer rounded-xl border-2 transition-all duration-200
                    ${sizeClasses.p}
                    ${isChecked
                        ? `${colors.border} ${colors.bg} shadow-sm ring-1 ${colors.ring.replace('focus:', '')}`
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }
                    ${finalDisabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                    ${className}
                `}
                style={style}
            >
                <input
                    type="radio"
                    name={finalName}
                    value={value}
                    checked={isChecked}
                    onChange={handleChange}
                    disabled={finalDisabled}
                    className="sr-only"
                />

                {/* Custom Radio Circle */}
                <div className={`
                    flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors
                    ${sizeClasses.circle}
                    ${isChecked ? colors.checked : 'border-slate-300 dark:border-slate-600'}
                `}>
                    <div className={`
                        rounded-full transition-transform duration-200
                        ${sizeClasses.dot}
                        ${colors.dot}
                        ${isChecked ? 'scale-100' : 'scale-0'}
                    `} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {icon && (
                            <Icon
                                icon={icon}
                               
                                className={isChecked ? colors.text : 'text-slate-400'}
                            />
                        )}
                        <span className={`font-semibold ${sizeClasses.text} ${isChecked ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                            {label}
                        </span>
                    </div>
                    {description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            </label>
        );
    }

    // Simple Variant (Default)
    return (
        <label
            className={`
                inline-flex items-start gap-3 cursor-pointer group
                ${finalDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
            style={style}
        >
            <div className="relative flex items-center mt-0.5">
                <input
                    type="radio"
                    name={finalName}
                    value={value}
                    checked={isChecked}
                    onChange={handleChange}
                    disabled={finalDisabled}
                    className="peer sr-only"
                />
                <div className={`
                    ${sizeClasses.circle}
                    rounded-full border-2 bg-white dark:bg-slate-900 transition-all duration-200
                    peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-offset-white dark:peer-focus:ring-offset-slate-950 ${colors.ring}
                    ${isChecked ? colors.checked : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400 dark:group-hover:border-slate-500'}
                    flex items-center justify-center
                `}>
                    <div className={`
                        ${sizeClasses.dot}
                        rounded-full transform transition-transform duration-200
                        ${colors.dot}
                        ${isChecked ? 'scale-100' : 'scale-0'}
                    `} />
                </div>
            </div>

            {(label || description) && (
                <div className="flex flex-col">
                    {label && (
                        <span className={`${sizeClasses.text} font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors`}>
                            {label}
                        </span>
                    )}
                    {description && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {description}
                        </span>
                    )}
                </div>
            )}
        </label>
    );
};

RadioGroup.propTypes = {
    children: PropTypes.node,
    value: PropTypes.any,
    defaultValue: PropTypes.any,
    onChange: PropTypes.func,
    name: PropTypes.string,
    orientation: PropTypes.oneOf(['horizontal', 'vertical']),
    label: PropTypes.string,
    description: PropTypes.string,
    error: PropTypes.string,
    className: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    color: PropTypes.oneOf(['violet', 'blue', 'emerald', 'rose', 'amber', 'black']),
    variant: PropTypes.oneOf(['simple', 'card']),
    disabled: PropTypes.bool
};

Radio.propTypes = {
    value: PropTypes.any,
    label: PropTypes.string,
    description: PropTypes.string,
    icon: PropTypes.string,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    checked: PropTypes.bool,
    onChange: PropTypes.func,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    color: PropTypes.oneOf(['violet', 'blue', 'emerald', 'rose', 'amber', 'black']),
    variant: PropTypes.oneOf(['simple', 'card'])
};

Radio.Group = RadioGroup;
export default Radio;
