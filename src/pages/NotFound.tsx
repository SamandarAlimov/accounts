import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="text-8xl font-bold text-primary">404</div>
        <h1 className="text-2xl font-semibold text-foreground">
          Sahifa topilmadi
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan bo'lishi mumkin.
        </p>
        <p className="text-sm text-muted-foreground">
          {countdown} soniyadan so'ng bosh sahifaga yo'naltirilasiz...
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate("/")} className="gap-2">
            <Home className="h-4 w-4" />
            Bosh sahifaga qaytish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
