import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "default" | "icon";
}

export function ThemeToggle({ className, variant = "icon" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={cn("relative overflow-hidden", className)}
      >
        <Sun className={cn(
          "h-5 w-5 transition-all duration-300",
          theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        )} />
        <Moon className={cn(
          "absolute h-5 w-5 transition-all duration-300",
          theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        )} />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={toggleTheme}
      className={cn("gap-2", className)}
    >
      {theme === "dark" ? (
        <>
          <Moon className="h-4 w-4" />
          Dark Mode
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          Light Mode
        </>
      )}
    </Button>
  );
}
