import { ForwardRefExoticComponent, RefAttributes, ReactNode, FC } from 'react';

// Common types
export type ChartColor = 'violet' | 'blue' | 'emerald' | 'rose' | 'amber' | 'slate';
export type ChartTheme = 'default' | 'glass' | 'dark';
export type LegendPosition = 'top' | 'bottom' | 'left' | 'right';
export type LegendAlign = 'start' | 'center' | 'end';
export type LegendShape = 'circle' | 'square' | 'line' | 'dashed' | 'diamond';

// Common legend props shared across charts
export interface ChartLegendOptions {
  showLegend?: boolean | 'auto';
  legendPosition?: LegendPosition;
  legendAlign?: LegendAlign;
  legendShape?: LegendShape;
  legendInteractive?: boolean;
}

// ============================================================================
// BAR CHART
// ============================================================================
export type BarChartVariant = 'default' | 'grouped' | 'stacked' | 'horizontal' | 'gradient';

export interface BarChartProps extends ChartLegendOptions {
  data?: any[];
  xKey?: string;
  yKey?: string | string[];
  variant?: BarChartVariant;
  color?: ChartColor;
  theme?: ChartTheme;
  rounded?: boolean;
  showGrid?: boolean;
  showValues?: boolean;
  animate?: boolean;
  barRadius?: number;
  width?: number;
  height?: number;
  barWidth?: number;
  gap?: number;
  showXAxis?: boolean;
  showYAxis?: boolean;
  yAxisWidth?: number;
  xAxisHeight?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showTooltip?: boolean;
  tooltipFormatter?: (item: any, value: number, key: string) => ReactNode;
  className?: string;
}

export const BarChart: ForwardRefExoticComponent<BarChartProps & RefAttributes<SVGSVGElement>>;

// ============================================================================
// LINE CHART
// ============================================================================
export type LineChartVariant = 'curved' | 'straight' | 'stepped' | 'dotted' | 'gradient';

export interface LineChartProps extends ChartLegendOptions {
  data?: any[];
  xKey?: string;
  yKey?: string | string[];
  variant?: LineChartVariant;
  color?: ChartColor;
  theme?: ChartTheme;
  showDots?: boolean;
  showGrid?: boolean;
  animate?: boolean;
  strokeWidth?: number;
  dotSize?: number;
  width?: number;
  height?: number;
  showXAxis?: boolean;
  showYAxis?: boolean;
  yAxisWidth?: number;
  xAxisHeight?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showTooltip?: boolean;
  tooltipFormatter?: (item: any, index: number) => ReactNode;
  className?: string;
}

export const LineChart: ForwardRefExoticComponent<LineChartProps & RefAttributes<SVGSVGElement>>;

// ============================================================================
// AREA CHART
// ============================================================================
export type AreaChartVariant = 'curved' | 'straight' | 'stacked' | 'gradient' | 'stepped';

export interface AreaChartProps extends ChartLegendOptions {
  data?: any[];
  xKey?: string;
  yKey?: string | string[];
  variant?: AreaChartVariant;
  color?: ChartColor;
  theme?: ChartTheme;
  showDots?: boolean;
  showGrid?: boolean;
  showLine?: boolean;
  animate?: boolean;
  strokeWidth?: number;
  dotSize?: number;
  fillOpacity?: number;
  width?: number;
  height?: number;
  showXAxis?: boolean;
  showYAxis?: boolean;
  yAxisWidth?: number;
  xAxisHeight?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showTooltip?: boolean;
  tooltipFormatter?: (item: any, index: number) => ReactNode;
  className?: string;
}

export const AreaChart: ForwardRefExoticComponent<AreaChartProps & RefAttributes<SVGSVGElement>>;

// ============================================================================
// PIE CHART
// ============================================================================
export type PieChartVariant = 'default' | 'donut' | 'semi' | 'rose' | 'exploded';

export interface PieChartProps {
  data?: any[];
  valueKey?: string;
  nameKey?: string;
  variant?: PieChartVariant;
  color?: ChartColor;
  theme?: ChartTheme;
  showLabels?: boolean;
  showPercentage?: boolean;
  animate?: boolean;
  donutWidth?: number;
  centerContent?: ReactNode;
  width?: number;
  height?: number;
  showTooltip?: boolean;
  tooltipFormatter?: (item: any, value: number, percentage: number) => ReactNode;
  showLegend?: boolean;
  legendPosition?: LegendPosition;
  legendAlign?: LegendAlign;
  legendShape?: LegendShape;
  legendInteractive?: boolean;
  className?: string;
}

export const PieChart: ForwardRefExoticComponent<PieChartProps & RefAttributes<SVGSVGElement>>;

// ============================================================================
// RADAR CHART
// ============================================================================
export type RadarChartVariant = 'default' | 'filled' | 'circle' | 'dots';

export interface RadarChartProps extends ChartLegendOptions {
  data?: any[];
  categories?: string[];
  variant?: RadarChartVariant;
  color?: ChartColor;
  theme?: ChartTheme;
  showGrid?: boolean;
  showLabels?: boolean;
  showDots?: boolean;
  fillOpacity?: number;
  animate?: boolean;
  levels?: number;
  width?: number;
  height?: number;
  showTooltip?: boolean;
  tooltipFormatter?: (item: any, category: string, value: number) => ReactNode;
  className?: string;
}

export const RadarChart: ForwardRefExoticComponent<RadarChartProps & RefAttributes<SVGSVGElement>>;

// ============================================================================
// RADIAL CHART
// ============================================================================
export type RadialChartVariant = 'default' | 'multi' | 'gauge' | 'semi';

export interface RadialChartProps {
  value?: number;
  maxValue?: number;
  label?: string;
  data?: any[];
  valueKey?: string;
  nameKey?: string;
  variant?: RadialChartVariant;
  color?: ChartColor;
  theme?: ChartTheme;
  strokeWidth?: number;
  gap?: number;
  showValue?: boolean;
  showLegend?: boolean;
  valueFormatter?: (value: number) => string;
  animate?: boolean;
  size?: number;
  className?: string;
}

export const RadialChart: ForwardRefExoticComponent<RadialChartProps & RefAttributes<HTMLDivElement>>;

// ============================================================================
// SPARKLINE CHART
// ============================================================================
export type SparklineChartVariant = 'default' | 'area' | 'bar' | 'dots';

export interface SparklineChartProps {
  data?: number[];
  variant?: SparklineChartVariant;
  color?: ChartColor;
  showArea?: boolean;
  strokeWidth?: number;
  animate?: boolean;
  showReference?: boolean;
  referenceValue?: number;
  showMinMax?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export const SparklineChart: ForwardRefExoticComponent<SparklineChartProps & RefAttributes<SVGSVGElement>>;

// ============================================================================
// UTILITIES
// ============================================================================
export interface ChartTooltipProps {
  x: number;
  y: number;
  visible: boolean;
  content: ReactNode;
  theme?: ChartTheme;
  chartRef?: React.RefObject<HTMLElement>;
}

export const ChartTooltip: FC<ChartTooltipProps>;

export interface ChartLegendItem {
  color: string;
  label: string;
  inactive?: boolean;
  value?: string | number;
}

export interface ChartLegendProps {
  items: ChartLegendItem[];
  position?: LegendPosition;
  align?: LegendAlign;
  shape?: LegendShape;
  interactive?: boolean;
  onToggle?: (index: number, active: boolean) => void;
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export const ChartLegend: FC<ChartLegendProps>;

export interface ChartCrosshairProps {
  x: number;
  y?: number;
  visible: boolean;
  chartHeight: number;
  points?: Array<{ y: number; color: string }>;
  color?: string;
  dashArray?: string;
}

export const ChartCrosshair: FC<ChartCrosshairProps>;

export const colorPalettes: Record<string, string[]>;
export const multiColors: string[];
export function getColor(palette: string, index?: number): string;
export function getShades(palette: string, count: number): string[];
export function formatNumber(num: number, compact?: boolean): string;
