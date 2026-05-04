import React, { useRef, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { getColor, useChartResize, useChartMount, CSS_EASE } from './ChartUtils';

/**
 * SparklineChart Component
 * 
 * Compact inline charts for dashboards, tables, and cards
 * 
 * Variants:
 * - default: Simple line sparkline
 * - area: Line with filled area
 * - bar: Mini bar chart
 * - dots: Dot plot
 */
const SparklineChart = forwardRef(({
  data = [],
  
  // Variant
  variant = 'default', // 'default' | 'area' | 'bar' | 'dots'
  
  // Appearance
  color = 'violet',
  showArea = false,
  strokeWidth = 2,
  animate = true,
  
  // Reference line
  showReference = false,
  referenceValue = null,
  
  // Min/Max indicators
  showMinMax = false,
  
  // Dimensions
  width = 100,
  height = 30,
  responsive = false,

  className = '',
  ...props
}, ref) => {
  const mounted = useChartMount(animate);
  const clipId = useRef(`spark-clip-${Math.random().toString(36).substr(2, 9)}`).current;
  const [resizeRef, chartW, chartH] = useChartResize(responsive, width, height, 100, 30);
  const widthToUse = chartW;
  const heightToUse = chartH;

  if (!data.length) return null;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  const padding = heightToUse * 0.1;

  const getY = (value) => {
    return heightToUse - padding - ((value - minValue) / range) * (heightToUse - padding * 2);
  };

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * widthToUse;
    const y = getY(value);
    return { x, y, value };
  });

  const primaryColor = getColor(color, 0);

  // Generate line path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  // Generate area path
  const areaPath = `${linePath} L ${points[points.length - 1]?.x || 0} ${heightToUse} L 0 ${heightToUse} Z`;

  // Find min/max indices
  const minIndex = data.indexOf(minValue);
  const maxIndex = data.indexOf(maxValue);

  // Render based on variant
  const renderContent = () => {
    switch (variant) {
      case 'bar':
        const barWidth = (widthToUse / data.length) * 0.8;
        const barGap = (widthToUse / data.length) * 0.2;
        return data.map((value, i) => {
          const barHeight = ((value - minValue) / range) * (heightToUse - padding * 2);
          return (
            <rect
              key={i}
              x={i * (barWidth + barGap)}
              y={heightToUse - barHeight - padding}
              width={barWidth}
              height={barHeight}
              fill={primaryColor}
              rx={1}
              className="transition-all duration-300"
            />
          );
        });
        
      case 'dots':
        return points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={3}
            fill={primaryColor}
            className="transition-all duration-300"
          />
        ));
        
      default:
        return (
          <>
            {(showArea || variant === 'area') && (
              <path
                d={areaPath}
                fill={primaryColor}
                fillOpacity={0.2}
                className="transition-all duration-300"
              />
            )}
            <path
              d={linePath}
              fill="none"
              stroke={primaryColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          </>
        );
    }
  };

  const isBarVariant = variant === 'bar';

  const svgEl = (
    <svg ref={ref} width={widthToUse} height={heightToUse} viewBox={`0 0 ${widthToUse} ${heightToUse}`} style={{ maxWidth: '100%', height: 'auto' }} className={className} {...props}>
      {animate && (
        <defs>
          <clipPath id={clipId}>
            <rect
              x={0}
              y={0}
              width={widthToUse}
              height={heightToUse}
              style={{
                transform: mounted
                  ? (isBarVariant ? 'scaleY(1)' : 'scaleX(1)')
                  : (isBarVariant ? 'scaleY(0)' : 'scaleX(0)'),
                transformOrigin: isBarVariant
                  ? `${widthToUse / 2}px ${heightToUse}px`
                  : '0 0',
                transition: `transform 0.6s ${CSS_EASE}`,
              }}
            />
          </clipPath>
        </defs>
      )}

      {/* Reference line */}
      {showReference && referenceValue !== null && (
        <line
          x1={0}
          y1={getY(referenceValue)}
          x2={widthToUse}
          y2={getY(referenceValue)}
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="2,2"
          className="text-slate-300 dark:text-slate-600"
        />
      )}
      
      <g clipPath={animate ? `url(#${clipId})` : undefined}>
        {renderContent()}
      </g>
      
      {/* Min/Max indicators */}
      {showMinMax && variant !== 'bar' && (
        <g clipPath={animate ? `url(#${clipId})` : undefined}>
          <circle
            cx={points[minIndex]?.x}
            cy={points[minIndex]?.y}
            r={3}
            fill="#ef4444"
          />
          <circle
            cx={points[maxIndex]?.x}
            cy={points[maxIndex]?.y}
            r={3}
            fill="#22c55e"
          />
        </g>
      )}
    </svg>
  );

  if (responsive) {
    return (
      <div ref={resizeRef} className={`w-full ${className}`} style={{ minHeight: heightToUse }}>
        {svgEl}
      </div>
    );
  }
  return svgEl;
});

SparklineChart.displayName = 'SparklineChart';

SparklineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number),
  variant: PropTypes.oneOf(['default', 'area', 'bar', 'dots']),
  color: PropTypes.oneOf(['violet', 'blue', 'emerald', 'rose', 'amber', 'slate']),
  showArea: PropTypes.bool,
  strokeWidth: PropTypes.number,
  animate: PropTypes.bool,
  showReference: PropTypes.bool,
  referenceValue: PropTypes.number,
  showMinMax: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number,
  responsive: PropTypes.bool,
  className: PropTypes.string,
};

export default SparklineChart;
