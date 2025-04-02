import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface NavbarProps {
  title: string;
  subtitle?: string;
}

export default function Navbar({ title, subtitle }: NavbarProps) {
  const { user, logoutMutation } = useAuth();
  const [_, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleProfileClick = () => {
    setLocation("/settings");
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && <p className="text-sm opacity-90">{subtitle}</p>}
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" aria-label="Notifications" className="text-primary-foreground hover:bg-primary/90">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Profile" className="text-primary-foreground hover:bg-primary/90">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.name || user?.username || "My Account"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileClick}>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
