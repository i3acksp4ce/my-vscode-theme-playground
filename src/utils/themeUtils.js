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
