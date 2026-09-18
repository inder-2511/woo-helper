import { Sun, Moon, Palette } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import Card from "../ui/Card";
import Button from "../ui/Button";

function ThemeSection() {
  const { dark, toggle } = useTheme();

  return (
    <Card
      title="Appearance"
      icon={Palette}
      description="Remembered in this browser."
    >
      <Button variant="ghost" icon={dark ? Sun : Moon} onClick={toggle}>
        Switch to {dark ? "light" : "dark"} mode
      </Button>
    </Card>
  );
}

export default ThemeSection;
