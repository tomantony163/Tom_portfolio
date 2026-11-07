import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ElementsBackground as ElementsCollection } from "./shaders/elements/ElementsBackground";
import { WarpFieldBackground } from "./shaders/warp-field/WarpFieldBackground";
import "./shaders/threeui.css";

const THEMES = [
  { id: "ocean", label: "Ocean", hue: 0 },
  { id: "amethyst", label: "Amethyst", hue: 65 },
  { id: "sunset", label: "Sunset", hue: 205 },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];

function getThemeHue() {
  const activeTheme = document.documentElement.dataset.theme;
  return THEMES.find(({ id }) => id === activeTheme)?.hue ?? THEMES[0].hue;
}

function useThemeHue() {
  const [hue, setHue] = useState(getThemeHue);

  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent<{ hue: number }>) {
        setHue(event.detail.hue);
      }
    };

    window.addEventListener("portfolio-theme-change", handleThemeChange);
    return () => window.removeEventListener("portfolio-theme-change", handleThemeChange);
  }, []);

  return hue;
}

function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState<ThemeId>("sunset");

  const selectTheme = (themeId: ThemeId) => {
    const theme = THEMES.find(({ id }) => id === themeId);
    if (!theme) return;

    document.documentElement.dataset.theme = theme.id;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content",
      theme.id === "ocean" ? "#090d18" : theme.id === "amethyst" ? "#100b1b" : "#180d14",
    );
    setActiveTheme(theme.id);
    window.dispatchEvent(new CustomEvent("portfolio-theme-change", { detail: { hue: theme.hue } }));
  };

  return (
    <div className="theme-switcher" role="group" aria-label="Choose page color theme">
      {THEMES.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={`theme-swatch theme-swatch-${id}`}
          aria-label={`${label} color theme`}
          aria-pressed={activeTheme === id}
          title={`${label} theme`}
          onClick={() => selectTheme(id)}
        />
      ))}
    </div>
  );
}

function WaterScene() {
  const hue = useThemeHue();
  return (
    <ElementsCollection
      variant="water"
      speed={1.00}
      size={1.00}
      particleAmount={1.00}
      hue={hue}
      saturation={1.00}
      brightness={1.00}
      opacity={1.00}
      className="page-water-background"
    />
  );
}

function LetterScene() {
  const hue = useThemeHue();
  return (
    <WarpFieldBackground
      variant="letters"
      speed={15.0}
      streakOpacity={0.60}
      tileOpacity={0.90}
      fov={75}
      hue={hue}
      saturation={1.00}
      brightness={1.00}
      className="warp-field-scene"
    />
  );
}

const backgroundMount = document.getElementById("water-background-root");

if (!backgroundMount) {
  throw new Error("Water background mount point was not found.");
}

createRoot(backgroundMount).render(<WaterScene />);

const mount = document.getElementById("warp-field-root");

if (!mount) {
  throw new Error("Warp field mount point was not found.");
}

createRoot(mount).render(<LetterScene />);

const themeMount = document.getElementById("theme-switcher-root");

if (!themeMount) {
  throw new Error("Color theme switcher mount point was not found.");
}

createRoot(themeMount).render(<ThemeSwitcher />);
