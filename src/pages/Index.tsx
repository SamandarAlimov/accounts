import { Link, Navigate } from "react-router-dom";
import { AlsamosLogo } from "@/components/AlsamosLogo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Shield, 
  Zap, 
  Users, 
  Lock, 
  ArrowRight, 
  Sparkles,
  GraduationCap,
  Heart,
  Wallet,
  Cloud,
  Database,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption with AI-powered threat detection keeps your data protected 24/7.",
  },
  {
    icon: Zap,
    title: "Instant Access",
    description: "One account unlocks the entire Alsamos ecosystem. No more password fatigue.",
  },
  {
    icon: Users,
    title: "Family Sharing",
    description: "Manage family accounts with granular controls and parental oversight.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "Your data stays yours. Full control over what you share and with whom.",
  },
];

const ecosystemApps = [
  { icon: GraduationCap, name: "Education", color: "from-blue-500 to-blue-600" },
  { icon: Heart, name: "Health", color: "from-red-500 to-red-600" },
  { icon: Wallet, name: "Finance", color: "from-green-500 to-green-600" },
  { icon: Sparkles, name: "AI", color: "from-primary to-[hsl(24,89%,44%)]" },
  { icon: Cloud, name: "Cloud", color: "from-cyan-500 to-cyan-600" },
  { icon: Database, name: "Data", color: "from-purple-500 to-purple-600" },
];

export default function Index() {
  const { user, loading } = useAuth();

  // Redirect authenticated users directly to dashboard
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <AlsamosLogo size="md" />
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link to="/security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Security
              </Link>
              <Link to="/developers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Developers
              </Link>
              <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Support
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <Button asChild>
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">
                      Get started
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative z-10 py-24 lg:py-32">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-primary/20 mb-8 animate-fade-up">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">
                AI-Integrated Identity Platform
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-up delay-100">
              One Account.{" "}
              <span className="text-gradient">Unlimited Access.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 animate-fade-up delay-200 max-w-2xl mx-auto">
              Your unified identity for the entire Alsamos ecosystem. Secure, seamless, and powered by AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
              {user ? (
                <Button size="xl" variant="premium" asChild>
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="xl" variant="premium" asChild>
                    <Link to="/register">
                      Create your account
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="xl" variant="outline" asChild>
                    <Link to="/login">
                      Sign in to existing account
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-12 text-sm text-muted-foreground animate-fade-up delay-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>256-bit Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem section */}
      <section className="relative z-10 py-20 border-t border-border/50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Access the entire ecosystem
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              One Alsamos Account gives you seamless access to all our services and products.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ecosystemApps.map((app, i) => (
              <div
                key={app.name}
                className="glass-card-hover p-6 text-center animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${app.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <app.icon className="h-7 w-7 text-white" />
                </div>
                <p className="font-medium text-foreground">Alsamos</p>
                <p className="text-sm text-muted-foreground">{app.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="relative z-10 py-20 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for the modern world
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Enterprise-grade security meets consumer-friendly simplicity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="glass-card p-6 animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="relative z-10 py-24">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to get started?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Create your Alsamos Account today and unlock access to the entire ecosystem.
              </p>
              {user ? (
                <Button size="xl" variant="premium" asChild>
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <Button size="xl" variant="premium" asChild>
                  <Link to="/register">
                    Create your free account
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <AlsamosLogo size="sm" />
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/security" className="hover:text-foreground transition-colors">Security</Link>
              <Link to="/help" className="hover:text-foreground transition-colors">Help Center</Link>
              <Link to="/status" className="hover:text-foreground transition-colors">Status</Link>
              <Link to="/careers" className="hover:text-foreground transition-colors">Careers</Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              © 2024 Alsamos Corporation
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
