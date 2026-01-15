import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';

const CheckboxContext = createContext(null);

/**
 * CheckboxGroup Component - Manages state for a group of Checkboxes
 */
export const CheckboxGroup = ({
    children,
    value,
    defaultValue = [],
    onChange,
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
    // Determine if controlled or uncontrolled
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue);

    // The actual array of selected values
    const currentValues = isControlled ? value : internalValue;

    const handleChildChange = (childValue, isChecked) => {
        let newValues;
        if (isChecked) {
            // Add to array if not already present
            newValues = [...currentValues, childValue];
        } else {
            // Remove from array
            newValues = currentValues.filter(v => v !== childValue);
        }

        if (!isControlled) {
            setInternalValue(newValues);
        }

        onChange?.(newValues);
    };

    return (
        <CheckboxContext.Provider value={{
            values: currentValues,
            onChange: handleChildChange,
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
        </CheckboxContext.Provider>
    );
};

// Colors for the checkbox
const colorConfig = {
    violet: {
        checked: 'bg-violet-500 border-violet-500',
        ring: 'focus:ring-violet-500',
        text: 'text-violet-700 dark:text-violet-300',
        bg: 'bg-violet-50 dark:bg-violet-900/20',
        border: 'border-violet-500/50'
    },
    blue: {
        checked: 'bg-blue-500 border-blue-500',
        ring: 'focus:ring-blue-500',
        text: 'text-blue-700 dark:text-blue-300',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-500/50'
    },
    emerald: {
        checked: 'bg-emerald-500 border-emerald-500',
        ring: 'focus:ring-emerald-500',
        text: 'text-emerald-700 dark:text-emerald-300',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-500/50'
    },
    rose: {
        checked: 'bg-rose-500 border-rose-500',
        ring: 'focus:ring-rose-500',
        text: 'text-rose-700 dark:text-rose-300',
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        border: 'border-rose-500/50'
    },
    amber: {
        checked: 'bg-amber-500 border-amber-500',
        ring: 'focus:ring-amber-500',
        text: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'border-amber-500/50'
    },
    black: {
        checked: 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white',
        ring: 'focus:ring-slate-500',
        text: 'text-slate-900 dark:text-white',
        bg: 'bg-slate-100 dark:bg-slate-800',
        border: 'border-slate-900/50 dark:border-white/50'
    }
};

/**
 * Checkbox Component - Individual checkbox
 */
const Checkbox = ({
    value,
    label,
    description,
    icon,
    disabled = false,
    className = '',
    style,
    // Direct props (override context)
    checked,
    defaultChecked,
    onChange, // only for standalone
    size,
    color,
    variant,
    indeterminate = false
}) => {
    const context = useContext(CheckboxContext);

    // Resolve props (context vs direct)
    const isGrouped = context !== null;
    const finalSize = size || (context?.size || 'md');
    const finalColor = color || (context?.color || 'violet');
    const finalVariant = variant || (context?.variant || 'simple');
    const finalDisabled = disabled || (context?.disabledGrp || false);

    // State for standalone usage
    const [internalChecked, setInternalChecked] = useState(defaultChecked || false);

    // If grouped, checked status depends on context.values
    // If standalone, controlled uses `checked`, uncontrolled uses `internalChecked`
    const isChecked = isGrouped
        ? context.values.includes(value)
        : (checked !== undefined ? checked : internalChecked);

    const handleChange = (e) => {
        if (finalDisabled) return;

        const newChecked = e.target.checked;

        if (isGrouped) {
            context.onChange(value, newChecked);
        } else {
            if (checked === undefined) {
                setInternalChecked(newChecked);
            }
            onChange?.(newChecked, e);
        }
    };

    const colors = colorConfig[finalColor] || colorConfig.violet;

    // Size logic
    const sizeClasses = {
        sm: { box: 'w-4 h-4 rounded', icon: 'text-[10px]', text: 'text-xs', p: 'p-3' },
        md: { box: 'w-5 h-5 rounded-md', icon: 'text-xs', text: 'text-sm', p: 'p-4' },
        lg: { box: 'w-6 h-6 rounded-md', icon: 'text-sm', text: 'text-base', p: 'p-5' }
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
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleChange}
                    disabled={finalDisabled}
                    className="sr-only"
                />

                {/* Custom Checkbox */}
                <div className={`
                    flex-shrink-0 border-2 flex items-center justify-center transition-all duration-200
                    ${sizeClasses.box}
                    ${isChecked ? colors.checked : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'}
                `}>
                    {isChecked && (
                        <Icon icon="check" className="text-white dark:text-slate-900" />
                    )}
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
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleChange}
                    disabled={finalDisabled}
                    className="peer sr-only"
                />
                <div className={`
                    ${sizeClasses.box}
                    border-2 transition-all duration-200 flex items-center justify-center
                    peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-offset-white dark:peer-focus:ring-offset-slate-950 ${colors.ring}
                    ${isChecked || indeterminate
                        ? colors.checked
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-slate-400 dark:group-hover:border-slate-500'
                    }
                `}>
                    {indeterminate ? (
                        <Icon icon="minus" className={`text-white dark:text-slate-900 ${sizeClasses.icon}`} />
                    ) : (
                        <Icon
                            icon="check"
                           
                            className={`
                                text-white dark:text-slate-900 transition-opacity duration-200
                                ${sizeClasses.icon}
                                ${isChecked ? 'opacity-100' : 'opacity-0'}
                            `}
                        />
                    )}
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

CheckboxGroup.propTypes = {
    children: PropTypes.node,
    value: PropTypes.array,
    defaultValue: PropTypes.array,
    onChange: PropTypes.func,
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

Checkbox.propTypes = {
    value: PropTypes.any,
    label: PropTypes.string,
    description: PropTypes.string,
    icon: PropTypes.string,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    checked: PropTypes.bool,
    defaultChecked: PropTypes.bool,
    onChange: PropTypes.func,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    color: PropTypes.oneOf(['violet', 'blue', 'emerald', 'rose', 'amber', 'black']),
    variant: PropTypes.oneOf(['simple', 'card']),
    indeterminate: PropTypes.bool
};

Checkbox.Group = CheckboxGroup;
export default Checkbox;
