import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';

const Button = forwardRef(({
    children,
    variant = 'primary', // primary, secondary, outline, ghost, danger
    size = 'md', // sm, md, lg
    color = 'violet', // violet, blue, emerald, rose, amber, black
    isLoading = false,
    startIcon,
    endIcon,
    fullWidth = false,
    disabled = false,
    className = '',
    type = 'button',
    ...props
}, ref) => {

    // Color Configurations
    const colorConfig = {
        violet: {
            primary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/20',
            secondary: 'bg-violet-100 hover:bg-violet-200 text-violet-700 dark:bg-violet-500/20 dark:hover:bg-violet-500/30 dark:text-violet-300',
            outline: 'border-violet-200 hover:border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-500/10',
            ghost: 'text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-500/10',
            ring: 'focus:ring-violet-500'
        },
        blue: {
            primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
            secondary: 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 dark:text-blue-300',
            outline: 'border-blue-200 hover:border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-500/10',
            ghost: 'text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10',
            ring: 'focus:ring-blue-500'
        },
        emerald: {
            primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
            secondary: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:text-emerald-300',
            outline: 'border-emerald-200 hover:border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-500/10',
            ghost: 'text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-500/10',
            ring: 'focus:ring-emerald-500'
        },
        rose: {
            primary: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
            secondary: 'bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 dark:text-rose-300',
            outline: 'border-rose-200 hover:border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-500/10',
            ghost: 'text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10',
            ring: 'focus:ring-rose-500'
        },
        amber: {
            primary: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
            secondary: 'bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:text-amber-300',
            outline: 'border-amber-200 hover:border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-500/10',
            ghost: 'text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-500/10',
            ring: 'focus:ring-amber-500'
        },
        black: {
            primary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200',
            secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200',
            outline: 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
            ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
            ring: 'focus:ring-slate-500'
        }
    };

    // Size Configurations
    const sizeConfig = {
        sm: 'px-3 py-1.5 text-xs font-medium',
        md: 'px-4 py-2 text-sm font-medium',
        lg: 'px-5 py-2.5 text-base font-medium'
    };

    const colors = colorConfig[color] || colorConfig.violet;

    // Get variant styles
    let variantStyles = colors[variant] || colors.primary;

    // Special case for 'danger' variant (usually red regardless of theme, but fitting the component structure)
    // If variant is 'danger', we might want to force standard red/rose colors or use the current theme's 'rose' equivalent if not explicitly separate.
    // For consistency with specific request logic, let's treat 'danger' as a red-override if needed, 
    // OR we can make 'danger' use the 'rose' palette if the user selected another color, 
    // BUT usually 'danger' implies semantic error. 
    // Let's map 'danger' to a hardcoded red style or just rely on 'rose' if color='rose'.
    // To keep it flexible, let's just stick to the requested colors. 
    // If the user wants a red button, they use color="rose". 
    // HOWEVER, typical button libs have a semantic 'danger'. 
    // Let's implement 'danger' as a specific override style using standard red/rose tokens regardless of 'color' prop,
    // OR just alias it to the 'rose' primary style.
    if (variant === 'danger') {
        variantStyles = 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 focus:ring-red-500';
    }

    // Base Styles
    // If outline, add border width. 
    const isOutline = variant === 'outline';
    const borderClass = isOutline ? 'border' : '';

    return (
        <button
            ref={ref}
            type={type}
            disabled={disabled || isLoading}
            className={`
                relative inline-flex items-center justify-center gap-2
                rounded-lg transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-950
                disabled:opacity-60 disabled:cursor-not-allowed
                shadow-sm hover:shadow-md active:scale-[0.98]
                ${sizeConfig[size]}
                ${variantStyles}
                ${colors.ring}
                ${borderClass}
                ${fullWidth ? 'w-full' : ''}
                ${className}
            `}
            {...props}
        >
            {/* Loading Spinner */}
            {isLoading && (
                <svg className="animate-spin -ml-1 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}

            {/* Start Icon */}
            {!isLoading && startIcon && (
                <Icon icon={startIcon} size={size === 'sm' ? 'xs' : 'sm'} />
            )}

            {/* Children (Text) */}
            <span>{children}</span>

            {/* End Icon */}
            {!isLoading && endIcon && (
                <Icon icon={endIcon} size={size === 'sm' ? 'xs' : 'sm'} />
            )}
        </button>
    );
});

Button.displayName = 'Button';

Button.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    color: PropTypes.oneOf(['violet', 'blue', 'emerald', 'rose', 'amber', 'black']),
    isLoading: PropTypes.bool,
    startIcon: PropTypes.string,
    endIcon: PropTypes.string,
    fullWidth: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    type: PropTypes.oneOf(['button', 'submit', 'reset'])
};

export default Button;
