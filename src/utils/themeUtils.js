import tinycolor from "tinycolor2";

export function convertThemeToShikiFormat(theme) {
  return {
    name: theme.name || "Custom Theme",
    type: theme.type || "dark",
    colors: theme.colors || {},
    settings: theme.tokenColors.map((token) => ({
      scope: token.scope,
      settings: token.settings,
    })),
  };
}

export function adjustBrightnessForTheme(theme, value) {
  const newTheme = JSON.parse(JSON.stringify(theme));
  newTheme.tokenColors = newTheme.tokenColors.map((token) => {
    if (token.settings && token.settings.foreground) {
      const color = tinycolor(token.settings.foreground);
      token.settings.foreground = color.brighten(value).toHexString();
    }
    return token;
  });
  return newTheme;
}

export function adjustLuminanceForTheme(theme, value) {
  const newTheme = JSON.parse(JSON.stringify(theme));
  newTheme.tokenColors = newTheme.tokenColors.map((token) => {
    if (token.settings && token.settings.foreground) {
      const color = tinycolor(token.settings.foreground);
      const hsl = color.toHsl();
      hsl.l = Math.max(0, Math.min(1, hsl.l + value / 100));
      token.settings.foreground = tinycolor(hsl).toHexString();
    }
    return token;
  });
  return newTheme;
}

export function adjustContrastForTheme(theme, value) {
  const newTheme = JSON.parse(JSON.stringify(theme));
  const factor = (100 + value) / 100; // Convert percentage to factor

  newTheme.tokenColors = newTheme.tokenColors.map((token) => {
    if (token.settings && token.settings.foreground) {
      const color = tinycolor(token.settings.foreground);
      const rgb = color.toRgb();

      // Calculate relative to middle gray (128)
      rgb.r = Math.min(
        255,
        Math.max(0, Math.round(128 + (rgb.r - 128) * factor))
      );
      rgb.g = Math.min(
        255,
        Math.max(0, Math.round(128 + (rgb.g - 128) * factor))
      );
      rgb.b = Math.min(
        255,
        Math.max(0, Math.round(128 + (rgb.b - 128) * factor))
      );

      token.settings.foreground = tinycolor(rgb).toHexString();
    }
    return token;
  });

  return newTheme;
}

export function getContrastRatio(color1, color2) {
  const l1 = tinycolor(color1).getLuminance();
  const l2 = tinycolor(color2).getLuminance();
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function improveWCAG(theme, level = "AA") {
  const backgroundColor = theme.colors?.["editor.background"] || "#0d1117"; // fallback if not found
  const minContrast = level === "AAA" ? 7 : 4.5;

  const newTheme = JSON.parse(JSON.stringify(theme));
  newTheme.tokenColors = newTheme.tokenColors.map((token) => {
    if (token.settings && token.settings.foreground) {
      let color = tinycolor(token.settings.foreground);
      let contrast = getContrastRatio(color, backgroundColor);

      while (contrast < minContrast && color.getLuminance() < 1) {
        const hsl = color.toHsl();
        hsl.l = Math.min(1, hsl.l + 0.01);
        color = tinycolor(hsl);
        contrast = getContrastRatio(color, backgroundColor);
      }

      token.settings.foreground = color.toHexString();
    }
    return token;
  });

  return newTheme;
}

export function calculateAverageContrastRatio(theme) {
  const backgroundColor = theme.colors?.["editor.background"] || "#0d1117";
  let totalRatio = 0;
  let count = 0;

  theme.tokenColors.forEach((token) => {
    if (token.settings?.foreground) {
      totalRatio += getContrastRatio(
        token.settings.foreground,
        backgroundColor
      );
      count++;
    }
  });

  return count > 0 ? totalRatio / count : 0;
}

function adjustColorToTargetContrast(
  color,
  backgroundColor,
  targetContrast,
  isIncrease = true
) {
  let adjustedColor = tinycolor(color);
  let currentContrast = getContrastRatio(adjustedColor, backgroundColor);
  const step = 0.01;

  while (
    isIncrease
      ? currentContrast < targetContrast && adjustedColor.getLuminance() < 1
      : currentContrast > targetContrast && adjustedColor.getLuminance() > 0
  ) {
    const hsl = adjustedColor.toHsl();
    hsl.l = Math.max(0, Math.min(1, hsl.l + (isIncrease ? step : -step)));
    adjustedColor = tinycolor(hsl);
    currentContrast = getContrastRatio(adjustedColor, backgroundColor);
  }

  return adjustedColor;
}

export function boostThemeContrast(theme) {
  const backgroundColor = theme.colors?.["editor.background"] || "#0d1117";
  const newTheme = JSON.parse(JSON.stringify(theme));

  newTheme.tokenColors = newTheme.tokenColors.map((token) => {
    if (token.settings?.foreground) {
      const color = tinycolor(token.settings.foreground);
      const currentContrast = getContrastRatio(color, backgroundColor);

      if (currentContrast < 6) {
        // Case 1: Increase contrast to minimum of 6:1
        const adjustedColor = adjustColorToTargetContrast(
          color,
          backgroundColor,
          6,
          true
        );
        token.settings.foreground = adjustedColor.toHexString();
      } else if (currentContrast >= 6.5 && currentContrast < 14.5) {
        // Case 2: Increase by exactly 0.5 contrast ratio
        const targetContrast = Math.min(currentContrast + 0.8, 14.5);
        let tempTheme = {
          tokenColors: [{ settings: { foreground: color.toHexString() } }],
        };
        let currentAdjustedContrast = currentContrast;
        let adjustmentValue = 1;
        let bestDiff = Infinity;
        let bestColor = color;

        // Try adjustments until we get as close as possible to target contrast
        while (
          adjustmentValue <= 100 &&
          currentAdjustedContrast < targetContrast
        ) {
          tempTheme = adjustContrastForTheme(
            {
              tokenColors: [{ settings: { foreground: color.toHexString() } }],
            },
            adjustmentValue
          );

          const adjustedColor = tinycolor(
            tempTheme.tokenColors[0].settings.foreground
          );
          currentAdjustedContrast = getContrastRatio(
            adjustedColor,
            backgroundColor
          );

          const diff = Math.abs(currentAdjustedContrast - targetContrast);
          if (diff < bestDiff && currentAdjustedContrast > currentContrast) {
            bestDiff = diff;
            bestColor = adjustedColor;

            // If we're within 0.01 of target, that's good enough
            if (diff < 0.01) break;
          }

          adjustmentValue += 1;
        }

        token.settings.foreground = bestColor.toHexString();
      } else if (currentContrast > 15) {
        // Case 3: Decrease contrast to exactly 13:1
        let tempTheme = {
          tokenColors: [{ settings: { foreground: color.toHexString() } }],
        };
        let currentAdjustedContrast = currentContrast;
        let adjustmentValue = -1;
        let bestDiff = Infinity;
        let bestColor = color;

        while (adjustmentValue >= -100 && currentAdjustedContrast > 15) {
          tempTheme = adjustContrastForTheme(
            {
              tokenColors: [{ settings: { foreground: color.toHexString() } }],
            },
            adjustmentValue
          );

          const adjustedColor = tinycolor(
            tempTheme.tokenColors[0].settings.foreground
          );
          currentAdjustedContrast = getContrastRatio(
            adjustedColor,
            backgroundColor
          );

          const diff = Math.abs(currentAdjustedContrast - 15);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestColor = adjustedColor;
            if (diff < 0.01) break;
          }

          adjustmentValue -= 1;
        }

        token.settings.foreground = bestColor.toHexString();
      }
    }
    return token;
  });

  return newTheme;
}
