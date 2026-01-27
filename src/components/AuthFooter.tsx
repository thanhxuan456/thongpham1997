import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { memo } from "react";

const AuthFooter = memo(() => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <p className="text-muted-foreground flex items-center gap-1">
            © 2024 ThemeVN. Made with <Heart className="h-3 w-3 text-accent fill-accent" /> in Vietnam
          </p>
          <div className="flex gap-4 text-muted-foreground">
            <Link to="/policy" className="hover:text-foreground transition-colors">
              Chính sách
            </Link>
            <Link to="/support" className="hover:text-foreground transition-colors">
              Hỗ trợ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

AuthFooter.displayName = "AuthFooter";

export default AuthFooter;
