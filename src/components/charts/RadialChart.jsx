import React, { useState, useEffect, useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { getColor, formatNumber, colorPalettes, ChartLegend } from './ChartUtils';

/**
 * RadialChart Component
 * 
 * Variants:
 * - default: Single radial progress
 * - multi: Multiple concentric radial bars
 * - gauge: Gauge-style with needle
 * - semi: Semi-circle progress
 */
const RadialChart = forwardRef(({
  // For single value
  value = 0,
  maxValue = 100,
  label,

  // For multi-bar
  data = [],
  valueKey = 'value',
  nameKey = 'name',

  // Variant
  variant = 'default', // 'default' | 'multi' | 'gauge' | 'semi'

  // Appearance
  color = 'violet',
  theme = 'default',
  strokeWidth = 12,
  gap = 8,
  showValue = true,
  showLegend = true,
  valueFormatter,
  animate = true,

  // Dimensions
  size = 150,

  className = '',
  ...props
}, ref) => {
  const [animationProgress, setAnimationProgress] = useState(animate ? 0 : 1);

  const isMulti = variant === 'multi' && data.length > 0;
  const isSemi = variant === 'semi';
  const isGauge = variant === 'gauge';

  const center = size / 2;

  // Memoize primary color to prevent recalculation on every render
  const primaryColor = useMemo(() => getColor(color, 0), [color]);

  // Create a stable key for value/data changes to reset animation
  const animationKey = useMemo(() => {
    if (isMulti) {
      return JSON.stringify(data.map(d => ({ value: d[valueKey], name: d[nameKey] })));
    }
    return `${value}-${maxValue}`;
  }, [isMulti, data, valueKey, nameKey, value, maxValue]);

  useEffect(() => {
    if (animate) {
      setAnimationProgress(0);
      let start;
      let animationFrame;
      const duration = 1000;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setAnimationProgress(progress);
        if (progress < 1) {
          animationFrame = requestAnimationFrame(step);
        }
      };
      animationFrame = requestAnimationFrame(step);
      return () => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
      };
    } else {
      setAnimationProgress(1);
    }
  }, [animate, animationKey]);

  // Get color shades for multi variant
  const getBarColor = (index) => {
    const palette = colorPalettes[color] || colorPalettes.violet;
    const step = Math.max(1, Math.floor(palette.length / data.length));
    return palette[Math.min(index * step, palette.length - 1)];
  };

  // Single radial progress
  const renderSingleRadial = () => {
    const radius = (size - strokeWidth) / 2;
    const circumference = isSemi ? Math.PI * radius : 2 * Math.PI * radius;
    const percentage = Math.min((value / maxValue) * 100, 100);
    const strokeDashoffset = circumference - (percentage / 100) * circumference * animationProgress;

    return (
      <>
        <svg
          width={size}
          height={isSemi ? size / 2 + 20 : size}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            className="text-slate-200 dark:text-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={primaryColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: animationProgress >= 1 ? 'stroke-dashoffset 0.3s ease' : 'none'
            }}
          />
        </svg>

        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {valueFormatter ? valueFormatter(value) : `${Math.round(percentage)}%`}
            </span>
            {label && (
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</span>
            )}
          </div>
        )}
      </>
    );
  };

  // Multi radial bars
  const renderMultiRadial = () => {
    const totalMax = Math.max(maxValue, ...data.map(d => d[valueKey] || 0));

    return (
      <>
        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        >
          {data.map((item, i) => {
            const radius = center - strokeWidth / 2 - i * (strokeWidth + gap) - 10;
            if (radius <= 0) return null;

            const circumference = 2 * Math.PI * radius;
            const itemValue = item[valueKey] || 0;
            const percentage = Math.min((itemValue / totalMax) * 100, 100);
            const strokeDashoffset = circumference - (percentage / 100) * circumference * animationProgress;
            const itemColor = getBarColor(i);

            return (
              <g key={i}>
                {/* Background */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  className="text-slate-200 dark:text-slate-700"
                />
                {/* Progress */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={itemColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  style={{
                    transition: animationProgress >= 1 ? 'stroke-dashoffset 0.3s ease' : 'none'
                  }}
                />
              </g>
            );
          })}
        </svg>

        {showLegend && (
          <ChartLegend
            items={data.map((item, i) => ({
              color: getBarColor(i),
              label: `${item[nameKey]} (${item[valueKey]})`
            }))}
          />
        )}
      </>
    );
  };

  // Gauge variant
  const renderGauge = () => {
    const radius = (size - strokeWidth) / 2 - 10;
    const gaugeHeight = size; // Full height for better visibility
    const gaugeCenterX = size / 2;
    // Position center so the gauge arc is properly visible
    const gaugeCenterY = gaugeHeight * 0.6;

    const startAngle = -225 * (Math.PI / 180); // Start at 225 degrees (bottom-left)
    const endAngle = 45 * (Math.PI / 180);     // End at 45 degrees (bottom-right)
    const totalAngle = endAngle - startAngle;

    const percentage = Math.min((value / maxValue) * 100, 100);
    const valueAngle = startAngle + (percentage / 100) * totalAngle * animationProgress;

    // Arc path - use gauge-specific center coordinates
    const polarToCartesian = (angle, r) => ({
      x: gaugeCenterX + Math.cos(angle) * r,
      y: gaugeCenterY + Math.sin(angle) * r
    });

    const start = polarToCartesian(startAngle, radius);
    const end = polarToCartesian(endAngle, radius);
    const valueEnd = polarToCartesian(valueAngle, radius);

    const largeArcFlag = totalAngle > Math.PI ? 1 : 0;
    const valueLargeArcFlag = (valueAngle - startAngle) > Math.PI ? 1 : 0;

    const bgPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
    const valuePath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${valueLargeArcFlag} 1 ${valueEnd.x} ${valueEnd.y}`;

    // Needle
    const needleLength = radius - 20;
    const needleEnd = polarToCartesian(valueAngle, needleLength);

    return (
      <>
        <svg width={size} height={gaugeHeight}>
          {/* Background arc */}
          <path
            d={bgPath}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="text-slate-200 dark:text-slate-700"
          />
          {/* Value arc */}
          <path
            d={valuePath}
            fill="none"
            stroke={primaryColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              transition: animationProgress >= 1 ? 'd 0.3s ease' : 'none'
            }}
          />

          {/* Needle */}
          <line
            x1={gaugeCenterX}
            y1={gaugeCenterY}
            x2={needleEnd.x}
            y2={needleEnd.y}
            stroke={primaryColor}
            strokeWidth={3}
            strokeLinecap="round"
            style={{
              transition: animationProgress >= 1 ? 'x2 0.3s ease, y2 0.3s ease' : 'none'
            }}
          />
          <circle
            cx={gaugeCenterX}
            cy={gaugeCenterY}
            r={8}
            fill={primaryColor}
          />
          <circle
            cx={gaugeCenterX}
            cy={gaugeCenterY}
            r={4}
            fill="white"
          />

          {/* Min/Max labels */}
          <text
            x={start.x - 5}
            y={start.y + 15}
            textAnchor="end"
            className="text-[10px] fill-slate-500 dark:fill-slate-400"
          >
            0
          </text>
          <text
            x={end.x + 5}
            y={end.y + 15}
            textAnchor="start"
            className="text-[10px] fill-slate-500 dark:fill-slate-400"
          >
            {formatNumber(maxValue, true)}
          </text>
        </svg>

        {showValue && (
          <div className="text-center -mt-4">
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {valueFormatter ? valueFormatter(value) : formatNumber(value)}
            </span>
            {label && (
              <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</span>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div ref={ref} className={`relative inline-flex flex-col items-center justify-center ${className}`} {...props}>
      {isMulti && renderMultiRadial()}
      {isGauge && renderGauge()}
      {!isMulti && !isGauge && renderSingleRadial()}
    </div>
  );
});

RadialChart.displayName = 'RadialChart';

RadialChart.propTypes = {
  value: PropTypes.number,
  maxValue: PropTypes.number,
  label: PropTypes.string,
  data: PropTypes.array,
  valueKey: PropTypes.string,
  nameKey: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'multi', 'gauge', 'semi']),
  color: PropTypes.oneOf(['violet', 'blue', 'emerald', 'rose', 'amber', 'slate']),
  theme: PropTypes.oneOf(['default', 'glass', 'dark']),
  strokeWidth: PropTypes.number,
  gap: PropTypes.number,
  showValue: PropTypes.bool,
  showLegend: PropTypes.bool,
  valueFormatter: PropTypes.func,
  animate: PropTypes.bool,
  size: PropTypes.number,
  className: PropTypes.string,
};

export default RadialChart;
