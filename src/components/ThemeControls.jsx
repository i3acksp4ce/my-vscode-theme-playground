import React, { memo } from "react";
import { useTheme } from "../context/ThemeContext";

const LoadingSpinner = () => (
  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
);

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
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 min-w-[200px]">
        <label className="text-sm whitespace-nowrap">Theme</label>
        <div className="flex items-center gap-2">
          <select
            value={selectedTheme}
            onChange={(e) => handleThemeChange(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1.5 rounded-md text-sm"
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
        className="flex items-center gap-4 opacity-75 pointer-events-none transition-opacity duration-200"
        style={{
          opacity: isLoading ? 0.5 : 1,
          pointerEvents: isLoading ? "none" : "auto",
        }}
      >
        <div className="flex items-center gap-2 min-w-[200px]">
          <label className="text-sm whitespace-nowrap">Brightness</label>
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <button
                onClick={() => {
                  const newValue = Number(brightness) - 10;
                  handleBrightnessChange(newValue < -100 ? -100 : newValue);
                }}
                className="px-2 py-1 bg-gray-600 rounded-l-md hover:bg-gray-700"
                disabled={brightness <= -100}
              >
                -
              </button>
              <span className="px-3 py-1 bg-gray-700 text-sm">
                {brightness}%
              </span>
              <button
                onClick={() => {
                  const newValue = Number(brightness) + 10;
                  handleBrightnessChange(newValue > 100 ? 100 : newValue);
                }}
                className="px-2 py-1 bg-gray-600 rounded-r-md hover:bg-gray-700"
                disabled={brightness >= 100}
              >
                +
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Current:{" "}
              {brightness === 0
                ? "Default"
                : `${brightness > 0 ? "+" : ""}${brightness}%`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-[200px]">
          <label className="text-sm whitespace-nowrap">Luminance</label>
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <button
                onClick={() => {
                  const newValue = Number(luminance) - 10;
                  handleLuminanceChange(newValue < -100 ? -100 : newValue);
                }}
                className="px-2 py-1 bg-gray-600 rounded-l-md hover:bg-gray-700"
                disabled={luminance <= -100}
              >
                -
              </button>
              <span className="px-3 py-1 bg-gray-700 text-sm">
                {luminance}%
              </span>
              <button
                onClick={() => {
                  const newValue = Number(luminance) + 10;
                  handleLuminanceChange(newValue > 100 ? 100 : newValue);
                }}
                className="px-2 py-1 bg-gray-600 rounded-r-md hover:bg-gray-700"
                disabled={luminance >= 100}
              >
                +
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Current:{" "}
              {luminance === 0
                ? "Default"
                : `${luminance > 0 ? "+" : ""}${luminance}%`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-[200px]">
          <label className="text-sm whitespace-nowrap">Contrast</label>
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              <button
                onClick={() => {
                  const newValue = Number(contrast) - 10;
                  handleContrastChange(newValue < -100 ? -100 : newValue);
                }}
                className="px-2 py-1 bg-gray-600 rounded-l-md hover:bg-gray-700"
                disabled={contrast <= -100}
              >
                -
              </button>
              <span className="px-3 py-1 bg-gray-700 text-sm">{contrast}%</span>
              <button
                onClick={() => {
                  const newValue = Number(contrast) + 10;
                  handleContrastChange(newValue > 100 ? 100 : newValue);
                }}
                className="px-2 py-1 bg-gray-600 rounded-r-md hover:bg-gray-700"
                disabled={contrast >= 100}
              >
                +
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Current:{" "}
              {contrast === 0
                ? "Default"
                : `${contrast > 0 ? "+" : ""}${contrast}%`}
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-2 opacity-75 pointer-events-none transition-opacity duration-200"
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
