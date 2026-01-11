import { SVGProps } from 'react';

/**
 * Icon Component Type Definitions
 */

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IconVariant = 'outline' | 'solid' | 'far' | 'fas';

export interface IconProps extends SVGProps<SVGSVGElement> {
    /**
     * Icon name from the icon library
     * @example icon="heart"
     */
    icon: string;

    /**
     * Icon variant
     * @default 'outline'
     */
    variant?: IconVariant;

    /**
     * Icon size preset
     * @example size="lg"
     */
    size?: IconSize;

    /**
     * Additional CSS classes
     */
    className?: string;
}

/**
 * List of all available icon names
 */
export declare const iconNames: string[];

/**
 * Icon categories with their icon names
 */
export declare const iconCategories: Record<string, string[]>;

declare const Icon: React.FC<IconProps>;
export default Icon;
