import React, { useMemo } from "react";
import tinycolor from "tinycolor2";

export function ColorWheel({ colors, size = 200, strokeWidth = 15 }) {
  // Generate full color wheel segments
  const wheelSegments = useMemo(() => {
    const segments = [];
    const segmentCount = 360;
    const radius = (size - strokeWidth) / 2;

    for (let i = 0; i < segmentCount; i++) {
      const startAngle = (i * Math.PI) / 180;
      const endAngle = ((i + 1) * Math.PI) / 180;

      const x1 = radius * Math.cos(startAngle) + size / 2;
      const y1 = radius * Math.sin(startAngle) + size / 2;
      const x2 = radius * Math.cos(endAngle) + size / 2;
      const y2 = radius * Math.sin(endAngle) + size / 2;

      segments.push({
        path: `M ${size / 2} ${
          size / 2
        } L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`,
        color: `hsl(${i}, 100%, 50%)`,
      });
    }
    return segments;
  }, [size, strokeWidth]);

  // Calculate positions for theme color dots
  const colorPoints = useMemo(() => {
    return colors.map((color) => {
      const hsl = tinycolor(color).toHsl();
      const angle = hsl.h * (Math.PI / 180);
      const radius = ((size - strokeWidth) / 2) * (0.6 + hsl.s * 0.4); // Adjust dot position based on saturation

      return {
        x: radius * Math.cos(angle) + size / 2,
        y: radius * Math.sin(angle) + size / 2,
        color,
        hue: hsl.h,
        saturation: hsl.s,
        lightness: hsl.l,
      };
    });
  }, [colors, size, strokeWidth]);

  return (
    <div className="relative">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
      >
        {/* Full color wheel background */}
        <g>
          {wheelSegments.map((segment, i) => (
            <path key={i} d={segment.path} fill={segment.color} stroke="none" />
          ))}
        </g>

        {/* Saturation rings (optional) */}
        <g opacity={0.1}>
          {[0.2, 0.4, 0.6, 0.8].map((r, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={((size - strokeWidth) / 2) * r}
              fill="none"
              stroke="white"
              strokeWidth={1}
            />
          ))}
        </g>

        {/* Theme color dots */}
        {colorPoints.map((point, i) => (
          <g key={i}>
            {/* Dot shadow/glow effect */}
            <circle
              cx={point.x}
              cy={point.y}
              r={6}
              fill="rgba(0,0,0,0.3)"
              filter="blur(2px)"
            />
            {/* Main dot */}
            <circle
              cx={point.x}
              cy={point.y}
              r={5}
              fill={point.color}
              stroke="white"
              strokeWidth={2}
            >
              <title>{point.color}</title>
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
}
