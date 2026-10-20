import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="pits-card max-w-md w-full text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-primary">404</h1>
        <p className="text-lg font-medium text-foreground">Ops! Página não encontrada</p>
        <p className="text-xs text-muted-foreground">
          O endereço <code className="font-mono text-foreground">{location.pathname}</code> não existe nesta plataforma.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
