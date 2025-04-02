import { useLocation } from "wouter";
import { 
  Home, 
  BarChart2, 
  PieChart, 
  Settings, 
  FileText
} from "lucide-react";

interface BottomNavigationProps {
  activePage: "home" | "transactions" | "budget" | "reports" | "settings";
}

export default function BottomNavigation({ activePage }: BottomNavigationProps) {
  const [_, setLocation] = useLocation();

  const navItems = [
    { name: "Home", icon: Home, route: "/", key: "home" },
    { name: "Transactions", icon: FileText, route: "/transactions", key: "transactions" },
    { name: "Budget", icon: BarChart2, route: "/budget", key: "budget" },
    { name: "Reports", icon: PieChart, route: "/reports", key: "reports" },
    { name: "Settings", icon: Settings, route: "/settings", key: "settings" },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 w-full fixed bottom-0 left-0 right-0 z-20">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`py-2 flex flex-col items-center flex-grow ${
              activePage === item.key ? "bottom-nav-item active" : "text-gray-500 dark:text-gray-400"
            }`}
            onClick={() => setLocation(item.route)}
          >
            <item.icon className={`h-5 w-5 ${
              activePage === item.key ? "bottom-nav-item active" : "text-gray-500 dark:text-gray-400"
            }`} />
            <span className="text-xs mt-1">{item.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
