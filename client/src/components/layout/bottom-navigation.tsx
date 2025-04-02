import { useLocation } from "wouter";
import { 
  Home, 
  BarChart2, 
  PieChart, 
  Settings, 
  FileText,
  Bot
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface BottomNavigationProps {
  activePage: "home" | "transactions" | "budget" | "finance-gpt" | "reports" | "settings";
}

export default function BottomNavigation({ activePage }: BottomNavigationProps) {
  const [_, setLocation] = useLocation();
  const { translate } = useLanguage();

  const navItems = [
    { name: translate("home"), icon: Home, route: "/", key: "home" },
    { name: translate("transactions"), icon: FileText, route: "/transactions", key: "transactions" },
    { name: translate("budget"), icon: BarChart2, route: "/budget", key: "budget" },
    { name: translate("financeGpt"), icon: Bot, route: "/finance-gpt", key: "finance-gpt" },
    { name: translate("reports"), icon: PieChart, route: "/reports", key: "reports" },
    { name: translate("settings"), icon: Settings, route: "/settings", key: "settings" },
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
