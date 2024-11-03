import React, { memo } from "react";
import { useTheme } from "../context/ThemeContext";

const LoadingSpinner = () => (
  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
);

const ValueSelector = ({ value, onChange, min = -100, max = 100, label }) => {
  // Generate values with step of 5
  const values = Array.from(
    { length: Math.floor((max - min) / 5) + 1 },
    (_, i) => min + i * 5
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-gray-700 text-white px-3 py-1.5 rounded-md text-sm appearance-none cursor-pointer"
        >
          {values.map((val) => (
            <option key={val} value={val}>
              {val === 0 ? "Default" : val > 0 ? `+${val}%` : `${val}%`}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 fill-current opacity-50" viewBox="0 0 20 20">
            <path d="M10 12l-6-6h12l-6 6z" transform="rotate(180 10 10)" />
          </svg>
        </div>
      </div>
      <div className="text-xs text-gray-400">
        Current: {value === 0 ? "Default" : `${value > 0 ? "+" : ""}${value}%`}
      </div>
    </div>
  );
};

const ThemeControls = memo(function ThemeControls() {
  const {
    brightness,
    luminance,
    contrast,
    selectedTheme,
    availableThemes,
    handleThemeChange,
    handleBrightnessChange,
    handleLuminanceChange,
    handleContrastChange,
    handleWCAG,
    handleReset,
    handleCopy,
    isLoading,
  } = useTheme();

  return (
    <div className="flex flex-wrap gap-6 p-4">
      <div className="flex-1 min-w-[200px] max-w-xs">
        <label className="text-sm font-medium mb-2 block">Theme</label>
        <div className="flex items-center gap-2">
          <select
            value={selectedTheme}
            onChange={(e) => handleThemeChange(e.target.value)}
            className="w-full bg-gray-700 text-white px-3 py-1.5 rounded-md text-sm"
            disabled={isLoading}
          >
            {Object.entries(availableThemes).map(([id, { name }]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          {isLoading && <LoadingSpinner />}
        </div>
      </div>

      <div
        className="flex flex-wrap gap-6 opacity-75 transition-opacity duration-200"
        style={{
          opacity: isLoading ? 0.5 : 1,
          pointerEvents: isLoading ? "none" : "auto",
        }}
      >
        <div className="w-[150px]">
          <ValueSelector
            value={brightness}
            onChange={handleBrightnessChange}
            label="Brightness"
          />
        </div>

        <div className="w-[150px]">
          <ValueSelector
            value={luminance}
            onChange={handleLuminanceChange}
            label="Luminance"
          />
        </div>

        <div className="w-[150px]">
          <ValueSelector
            value={contrast}
            onChange={handleContrastChange}
            label="Contrast"
          />
        </div>
      </div>

      <div
        className="flex flex-wrap items-end gap-2"
        style={{
          opacity: isLoading ? 0.5 : 1,
          pointerEvents: isLoading ? "none" : "auto",
        }}
      >
        <button
          onClick={() => handleWCAG("AA")}
          className="bg-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm"
        >
          WCAG AA
        </button>
        <button
          onClick={() => handleWCAG("AAA")}
          className="bg-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm"
        >
          WCAG AAA
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-700 text-sm"
        >
          Reset
        </button>
        <button
          onClick={handleCopy}
          className="bg-green-600 px-3 py-1.5 rounded-md hover:bg-green-700 text-sm"
        >
          Copy
        </button>
      </div>
    </div>
  );
});

export default ThemeControls;
