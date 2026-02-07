import React, { useState, useRef, useEffect, useMemo, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { getColor, formatNumber, ChartTooltip, ChartLegend, multiColors } from './ChartUtils';

/**
 * RadarChart Component
 * 
 * Variants:
 * - default: Basic radar/spider chart
 * - filled: Solid fill with low opacity
 * - circle: Circular grid instead of polygon
 * - dots: Emphasize data points with larger dots
 *
 * Features:
 * - Configurable legend (position, shape, interactive toggle)
 * - Hover snap on data points with tooltip
 * - Multi-series comparison
 */
const RadarChart = forwardRef(({
  data = [],
  categories = [],

  // Variant
  variant = 'default', // 'default' | 'filled' | 'circle' | 'dots'

  // Appearance
  color = 'violet',
  theme = 'default',
  showGrid = true,
  showLabels = true,
  showDots = true,
  fillOpacity = 0.2,
  animate = true,
  levels = 5,

  // Dimensions
  width = 300,
  height = 300,

  // Tooltip
  showTooltip = true,
  tooltipFormatter,

  // Legend
  showLegend = 'auto',
  legendPosition = 'bottom',
  legendAlign = 'center',
  legendShape = 'circle',
  legendInteractive = false,

  className = '',
  ...props
}, ref) => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });
  const [animationProgress, setAnimationProgress] = useState(animate ? 0 : 1);
  const [hoveredPoint, setHoveredPoint] = useState(null); // { seriesIndex, categoryIndex }
  const [hiddenSeries, setHiddenSeries] = useState(new Set());
  const containerRef = useRef(null);

  useEffect(() => {
    if (animate) {
      let start;
      const duration = 800;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setAnimationProgress(progress);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, [animate, data]);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 40;

  const numCategories = categories.length;
  const angleStep = (2 * Math.PI) / numCategories;

  const maxValue = useMemo(() => {
    const visibleData = data.filter((_, i) => !hiddenSeries.has(i));
    if (visibleData.length === 0) return Math.max(...data.flatMap(d => categories.map(cat => d[cat] || 0)));
    return Math.max(...visibleData.flatMap(d => categories.map(cat => d[cat] || 0)));
  }, [data, categories, hiddenSeries]);

  const isMultiSeries = data.length > 1;

  const getPoint = (categoryIndex, value) => {
    const angle = categoryIndex * angleStep - Math.PI / 2;
    const r = (value / maxValue) * radius * animationProgress;
    return {
      x: centerX + Math.cos(angle) * r,
      y: centerY + Math.sin(angle) * r
    };
  };

  // Render grid
  const renderGrid = () => {
    if (!showGrid) return null;
    const isCircular = variant === 'circle';

    return (
      <g className="grid">
        {Array.from({ length: levels }, (_, level) => {
          const r = (radius / levels) * (level + 1);

          if (isCircular) {
            return (
              <circle
                key={level}
                cx={centerX}
                cy={centerY}
                r={r}
                fill="none"
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeWidth={1}
              />
            );
          }

          const points = categories.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            return `${centerX + Math.cos(angle) * r},${centerY + Math.sin(angle) * r}`;
          }).join(' ');

          return (
            <polygon
              key={level}
              points={points}
              fill="none"
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth={1}
            />
          );
        })}

        {categories.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={centerX + Math.cos(angle) * radius}
              y2={centerY + Math.sin(angle) * radius}
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth={1}
            />
          );
        })}
      </g>
    );
  };

  // Render labels
  const renderLabels = () => {
    if (!showLabels) return null;

    return categories.map((cat, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const labelRadius = radius + 20;
      const x = centerX + Math.cos(angle) * labelRadius;
      const y = centerY + Math.sin(angle) * labelRadius;

      return (
        <text
          key={i}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[11px] fill-slate-600 dark:fill-slate-400"
        >
          {cat}
        </text>
      );
    });
  };

  // Get color for data series
  const getSeriesColor = (index) => {
    if (isMultiSeries) {
      return multiColors[index % multiColors.length];
    }
    return getColor(color, 0);
  };

  // Render data polygons
  const renderData = () => {
    return data.map((item, di) => {
      if (hiddenSeries.has(di)) return null;

      const points = categories.map((cat, i) => {
        const point = getPoint(i, item[cat] || 0);
        return `${point.x},${point.y}`;
      }).join(' ');

      const dataColor = getSeriesColor(di);
      const isFilled = variant === 'filled' || variant === 'default';
      const dotRadius = variant === 'dots' ? 6 : 4;

      return (
        <g key={di}>
          <polygon
            points={points}
            fill={isFilled ? dataColor : 'none'}
            fillOpacity={isFilled ? fillOpacity : 0}
            stroke={dataColor}
            strokeWidth={2}
            className="transition-all duration-300"
          />

          {(showDots || variant === 'dots') && categories.map((cat, i) => {
            const point = getPoint(i, item[cat] || 0);
            const isPointHovered = hoveredPoint && hoveredPoint.seriesIndex === di && hoveredPoint.categoryIndex === i;
            return (
              <g key={i}>
                {/* Hover glow */}
                {isPointHovered && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={dotRadius + 6}
                    fill={dataColor}
                    opacity={0.15}
                  />
                )}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isPointHovered ? dotRadius + 2 : dotRadius}
                  fill="white"
                  stroke={dataColor}
                  strokeWidth={2}
                  className="cursor-pointer transition-all duration-150"
                  onMouseMove={(e) => {
                    setHoveredPoint({ seriesIndex: di, categoryIndex: i });
                    if (!showTooltip) return;
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) {
                      const content = tooltipFormatter
                        ? tooltipFormatter(item, cat, item[cat])
                        : (
                          <div className="text-slate-700 dark:text-slate-200 min-w-[100px]">
                            <div className="font-medium text-slate-900 dark:text-white mb-1 pb-1 border-b border-slate-100 dark:border-slate-700">{cat}</div>
                            {isMultiSeries && (
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dataColor }} />
                                <span className="text-xs text-slate-500">{item.name || `Series ${di + 1}`}</span>
                              </div>
                            )}
                            <div className="font-semibold text-sm">{formatNumber(item[cat] || 0)}</div>
                          </div>
                        );
                      setTooltip({
                        visible: true,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                        content
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredPoint(null);
                    setTooltip({ ...tooltip, visible: false });
                  }}
                />
              </g>
            );
          })}
        </g>
      );
    });
  };

  // Legend toggle
  const handleLegendToggle = useCallback((index) => {
    if (!legendInteractive) return;
    setHiddenSeries(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, [legendInteractive]);

  const shouldShowLegend = showLegend === true || (showLegend === 'auto' && isMultiSeries);

  const legendItems = data.map((item, i) => ({
    color: getSeriesColor(i),
    label: item.name || `Series ${i + 1}`,
    inactive: hiddenSeries.has(i),
  }));

  const isLegendSide = legendPosition === 'left' || legendPosition === 'right';

  return (
    <div
      ref={containerRef}
      className={`relative ${isLegendSide && shouldShowLegend ? 'flex items-center' : ''} ${className}`}
      {...props}
    >
      {shouldShowLegend && legendPosition === 'top' && (
        <ChartLegend items={legendItems} position="top" align={legendAlign} shape={legendShape} interactive={legendInteractive} onToggle={handleLegendToggle} />
      )}
      {shouldShowLegend && legendPosition === 'left' && (
        <ChartLegend items={legendItems} position="left" align={legendAlign} shape={legendShape} interactive={legendInteractive} onToggle={handleLegendToggle} layout="vertical" />
      )}
      <div className="relative">
        <svg ref={ref} width={width} height={height} className="overflow-visible">
          {renderGrid()}
          {renderLabels()}
          {renderData()}
        </svg>
        <ChartTooltip {...tooltip} theme={theme} chartRef={containerRef} />
      </div>
      {shouldShowLegend && legendPosition === 'right' && (
        <ChartLegend items={legendItems} position="right" align={legendAlign} shape={legendShape} interactive={legendInteractive} onToggle={handleLegendToggle} layout="vertical" />
      )}
      {shouldShowLegend && (legendPosition === 'bottom' || !legendPosition) && (
        <ChartLegend items={legendItems} position="bottom" align={legendAlign} shape={legendShape} interactive={legendInteractive} onToggle={handleLegendToggle} />
      )}
    </div>
  );
});

RadarChart.displayName = 'RadarChart';

RadarChart.propTypes = {
  data: PropTypes.array,
  categories: PropTypes.arrayOf(PropTypes.string),
  variant: PropTypes.oneOf(['default', 'filled', 'circle', 'dots']),
  color: PropTypes.oneOf(['violet', 'blue', 'emerald', 'rose', 'amber', 'slate']),
  theme: PropTypes.oneOf(['default', 'glass', 'dark']),
  showGrid: PropTypes.bool,
  showLabels: PropTypes.bool,
  showDots: PropTypes.bool,
  fillOpacity: PropTypes.number,
  animate: PropTypes.bool,
  levels: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  showTooltip: PropTypes.bool,
  tooltipFormatter: PropTypes.func,
  showLegend: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['auto'])]),
  legendPosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  legendAlign: PropTypes.oneOf(['start', 'center', 'end']),
  legendShape: PropTypes.oneOf(['circle', 'square', 'line', 'dashed', 'diamond']),
  legendInteractive: PropTypes.bool,
  className: PropTypes.string,
};

export default RadarChart;
