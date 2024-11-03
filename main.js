import "./style.css";
import syntaxColor from "./syntax-color.json";
import tinycolor from "tinycolor2";

const BACKGROUND_COLOR = "#0d1117";

function getContrastRatio(color1, color2) {
  const l1 = tinycolor(color1).getLuminance();
  const l2 = tinycolor(color2).getLuminance();
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function adjustColorForWCAG(color, targetLevel = 'AA') {
  const bgColor = tinycolor(BACKGROUND_COLOR);
  let foreColor = tinycolor(color);
  
  const minContrastRatio = targetLevel === 'AAA' ? 7 : 4.5;
  let currentContrast = getContrastRatio(foreColor, bgColor);
  
  if (currentContrast >= minContrastRatio) {
    return color; // Already meets the criteria
  }
  
  // If color has opacity, adjust only the opacity
  if (foreColor.getAlpha() < 1) {
    while (currentContrast < minContrastRatio && foreColor.getAlpha() < 1) {
      foreColor.setAlpha(foreColor.getAlpha() + 0.01);
      currentContrast = getContrastRatio(foreColor, bgColor);
    }
    return foreColor.toRgbString();
  }
  
  // Adjust luminance
  const step = 0.01;
  const increaseLuminance = currentContrast < minContrastRatio;
  
  while (currentContrast < minContrastRatio && foreColor.getLuminance() > 0 && foreColor.getLuminance() < 1) {
    const hsl = foreColor.toHsl();
    hsl.l = increaseLuminance ? Math.min(1, hsl.l + step) : Math.max(0, hsl.l - step);
    foreColor = tinycolor(hsl);
    currentContrast = getContrastRatio(foreColor, bgColor);
  }
  
  return foreColor.toHexString();
}

function processJsonColors(data, targetLevel) {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => processJsonColors(item, targetLevel));
  }

  const result = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'object' && value !== null) {
      result[key] = processJsonColors(value, targetLevel);
    } else if (typeof value === 'string' && value.startsWith('#')) {
      result[key] = adjustColorForWCAG(value, targetLevel);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function generateRandomVariant(colors) {
  const result = JSON.parse(JSON.stringify(colors)); // Deep clone
  
  function randomizeColor(color) {
    const hsl = tinycolor(color).toHsl();
    hsl.h = (hsl.h + Math.random() * 60 - 30) % 360; // Shift hue by -30 to +30 degrees
    hsl.s = Math.max(0, Math.min(1, hsl.s + Math.random() * 0.2 - 0.1)); // Adjust saturation by ±10%
    return tinycolor(hsl).toHexString();
  }

  function processObject(obj) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        processObject(value);
      } else if (typeof value === 'string' && value.startsWith('#')) {
        obj[key] = randomizeColor(value);
      }
    }
  }

  processObject(result);
  return result;
}

function adjustLuminance(colors, amount) {
  const result = JSON.parse(JSON.stringify(colors)); // Deep clone

  function adjustColor(color) {
    const hsl = tinycolor(color).toHsl();
    hsl.l = Math.max(0, Math.min(1, hsl.l + amount));
    return tinycolor(hsl).toHexString();
  }

  function processObject(obj) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        processObject(value);
      } else if (typeof value === 'string' && value.startsWith('#')) {
        obj[key] = adjustColor(value);
      }
    }
  }

  processObject(result);
  return result;
}

function displayResults(aaColors, aaaColors, randomVariant, defaultColors) {
  document.querySelector("#app").innerHTML = `
    <div>
      <h2>WCAG AA Compliant Colors</h2>
      <textarea id="aaColors" style="width:100%; height:200px;"></textarea>
    </div>
    <div>
      <h2>WCAG AAA Compliant Colors</h2>
      <textarea id="aaaColors" style="width:100%; height:200px;"></textarea>
    </div>
    <div>
      <h2>Random Color Variant</h2>
      <textarea id="randomVariant" style="width:100%; height:200px;"></textarea>
    </div>
    <div>
      <h2>Default Syntax Colors with Luminance Adjustment</h2>
      <textarea id="defaultColors" style="width:100%; height:200px;"></textarea>
      <div>
        <button id="increaseLuminance">Increase Luminance</button>
        <button id="decreaseLuminance">Decrease Luminance</button>
      </div>
    </div>
    <button id="newVariant">Generate New Random Variant</button>
  `;

  document.querySelector("#aaColors").value = JSON.stringify(aaColors, null, 2);
  document.querySelector("#aaaColors").value = JSON.stringify(aaaColors, null, 2);
  document.querySelector("#randomVariant").value = JSON.stringify(randomVariant, null, 2);
  document.querySelector("#defaultColors").value = JSON.stringify(defaultColors, null, 2);

  document.querySelector("#newVariant").addEventListener("click", () => {
    const newRandomVariant = generateRandomVariant(syntaxColor);
    document.querySelector("#randomVariant").value = JSON.stringify(newRandomVariant, null, 2);
  });

  document.querySelector("#increaseLuminance").addEventListener("click", () => {
    const currentColors = JSON.parse(document.querySelector("#defaultColors").value);
    const adjustedColors = adjustLuminance(currentColors, 0.02);
    document.querySelector("#defaultColors").value = JSON.stringify(adjustedColors, null, 2);
  });

  document.querySelector("#decreaseLuminance").addEventListener("click", () => {
    const currentColors = JSON.parse(document.querySelector("#defaultColors").value);
    const adjustedColors = adjustLuminance(currentColors, -0.02);
    document.querySelector("#defaultColors").value = JSON.stringify(adjustedColors, null, 2);
  });
}

const aaCompliantColors = processJsonColors(syntaxColor, 'AA');
const aaaCompliantColors = processJsonColors(syntaxColor, 'AAA');
const randomVariant = generateRandomVariant(syntaxColor);

displayResults(aaCompliantColors, aaaCompliantColors, randomVariant, syntaxColor);