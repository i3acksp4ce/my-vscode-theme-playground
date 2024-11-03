import React, { memo } from "react";
import { useTheme } from "../context/ThemeContext";

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
  } = useTheme();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 min-w-[200px]">
        <label className="text-sm whitespace-nowrap">Theme</label>
        <select
          value={selectedTheme}
          onChange={(e) => handleThemeChange(e.target.value)}
          className="bg-gray-700 text-white px-3 py-1.5 rounded-md text-sm"
        >
          {Object.entries(availableThemes).map(([id, { name }]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 min-w-[200px]">
          <label className="text-sm whitespace-nowrap">Brightness</label>
          <div className="flex items-center">
            <button
              onClick={() => handleBrightnessChange(brightness - 1)}
              className="px-2 py-1 bg-gray-600 rounded-l-md hover:bg-gray-700"
              disabled={brightness <= -100}
            >
              -
            </button>
            <span className="px-3 py-1 bg-gray-700 text-sm">{brightness}</span>
            <button
              onClick={() => handleBrightnessChange(brightness + 1)}
              className="px-2 py-1 bg-gray-600 rounded-r-md hover:bg-gray-700"
              disabled={brightness >= 100}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-[200px]">
          <label className="text-sm whitespace-nowrap">Luminance</label>
          <div className="flex items-center">
            <button
              onClick={() => handleLuminanceChange(luminance - 1)}
              className="px-2 py-1 bg-gray-600 rounded-l-md hover:bg-gray-700"
              disabled={luminance <= -100}
            >
              -
            </button>
            <span className="px-3 py-1 bg-gray-700 text-sm">{luminance}</span>
            <button
              onClick={() => handleLuminanceChange(luminance + 1)}
              className="px-2 py-1 bg-gray-600 rounded-r-md hover:bg-gray-700"
              disabled={luminance >= 100}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-[200px]">
          <label className="text-sm whitespace-nowrap">Contrast</label>
          <div className="flex items-center">
            <button
              onClick={() => handleContrastChange(contrast - 1)}
              className="px-2 py-1 bg-gray-600 rounded-l-md hover:bg-gray-700"
              disabled={contrast <= -100}
            >
              -
            </button>
            <span className="px-3 py-1 bg-gray-700 text-sm">{contrast}</span>
            <button
              onClick={() => handleContrastChange(contrast + 1)}
              className="px-2 py-1 bg-gray-600 rounded-r-md hover:bg-gray-700"
              disabled={contrast >= 100}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
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
