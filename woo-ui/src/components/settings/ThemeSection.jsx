import { Sun, Moon, Palette } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function ThemeSection() {
  const { dark, toggle } = useTheme();

  return (
    <div className="woo-card">
      <div className="flex items-center gap-2 mb-1">
        <Palette size={18} className="text-purple-500" />
        <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">
          Appearance
        </h2>
      </div>
      <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
        Remembered in this browser.
      </p>

      <button onClick={toggle} className="woo-btn-ghost">
        {dark ? <Sun size={15} /> : <Moon size={15} />}
        Switch to {dark ? "light" : "dark"} mode
      </button>
    </div>
  );
}

export default ThemeSection;
