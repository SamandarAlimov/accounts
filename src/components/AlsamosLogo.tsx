import { cn } from "@/lib/utils";
import alsamosLogo from "@/assets/alsamos-logo.ico";

interface AlsamosLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  glowing?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const textSizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
};

export function AlsamosLogo({ 
  className, 
  size = "md", 
  showText = true,
  glowing = false 
}: AlsamosLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div 
        className={cn(
          "relative flex items-center justify-center",
          sizeClasses[size],
          glowing && "animate-pulse-glow"
        )}
      >
        {/* Glow effect */}
        {glowing && (
          <div className="absolute inset-0 rounded-xl bg-primary blur-xl opacity-50" />
        )}
        <img
          src={alsamosLogo}
          alt="Alsamos"
          className="relative z-10 h-full w-full object-contain"
        />
      </div>
      {showText && (
        <span className={cn(
          "font-semibold tracking-tight text-foreground",
          textSizeClasses[size]
        )}>
          Alsamos
        </span>
      )}
    </div>
  );
}
