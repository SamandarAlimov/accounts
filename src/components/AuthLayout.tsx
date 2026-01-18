import { ReactNode } from "react";
import { AlsamosLogo } from "./AlsamosLogo";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Top right glow */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        {/* Bottom left glow */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        {/* Center subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link to="/" className="inline-block">
          <AlsamosLogo size="md" glowing />
        </Link>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Title section */}
          <div className="text-center mb-8 animate-fade-up">
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground text-base">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form card */}
          <div className="glass-card p-8 animate-fade-up delay-100">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-4">
        <div className="max-w-md mx-auto flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <span className="text-muted-foreground/30">•</span>
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <span className="text-muted-foreground/30">•</span>
          <Link to="/help" className="hover:text-foreground transition-colors">
            Help
          </Link>
          <span className="text-muted-foreground/30">•</span>
          <button className="hover:text-foreground transition-colors">
            English (US)
          </button>
        </div>
      </footer>
    </div>
  );
}
