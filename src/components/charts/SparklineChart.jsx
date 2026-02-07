import React, { useState, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { getColor } from './ChartUtils';

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
  
  className = '',
  ...props
}, ref) => {
  const [animationProgress, setAnimationProgress] = useState(animate ? 0 : 1);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimationProgress(1), 50);
      return () => clearTimeout(timer);
    }
  }, [animate, data]);

  if (!data.length) return null;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  const padding = height * 0.1;

  const getY = (value) => {
    return height - padding - ((value - minValue) / range) * (height - padding * 2);
  };

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = getY(value);
    return { x, y, value };
  });

  const visiblePoints = points.slice(0, Math.ceil(points.length * animationProgress) || 1);
  const primaryColor = getColor(color, 0);

  // Generate line path
  const linePath = visiblePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  // Generate area path
  const areaPath = `${linePath} L ${visiblePoints[visiblePoints.length - 1]?.x || 0} ${height} L 0 ${height} Z`;

  // Find min/max indices
  const minIndex = data.indexOf(minValue);
  const maxIndex = data.indexOf(maxValue);

  // Render based on variant
  const renderContent = () => {
    switch (variant) {
      case 'bar':
        const barWidth = (width / data.length) * 0.8;
        const barGap = (width / data.length) * 0.2;
        return data.slice(0, Math.ceil(data.length * animationProgress)).map((value, i) => {
          const barHeight = ((value - minValue) / range) * (height - padding * 2);
          return (
            <rect
              key={i}
              x={i * (barWidth + barGap)}
              y={height - barHeight - padding}
              width={barWidth}
              height={barHeight}
              fill={primaryColor}
              rx={1}
              className="transition-all duration-300"
            />
          );
        });
        
      case 'dots':
        return visiblePoints.map((point, i) => (
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

  return (
    <svg ref={ref} width={width} height={height} className={className} {...props}>
      {/* Reference line */}
      {showReference && referenceValue !== null && (
        <line
          x1={0}
          y1={getY(referenceValue)}
          x2={width}
          y2={getY(referenceValue)}
          stroke="currentColor"
          strokeWidth={1}
          strokeDasharray="2,2"
          className="text-slate-300 dark:text-slate-600"
        />
      )}
      
      {renderContent()}
      
      {/* Min/Max indicators */}
      {showMinMax && variant !== 'bar' && (
        <>
          <circle
            cx={points[minIndex]?.x}
            cy={points[minIndex]?.y}
            r={3}
            fill="#ef4444"
            className="transition-all duration-300"
          />
          <circle
            cx={points[maxIndex]?.x}
            cy={points[maxIndex]?.y}
            r={3}
            fill="#22c55e"
            className="transition-all duration-300"
          />
        </>
      )}
    </svg>
  );
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
  className: PropTypes.string,
};

export default SparklineChart;
