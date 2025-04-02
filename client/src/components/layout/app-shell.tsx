import { ReactNode } from "react";
import Navbar from "./navbar";
import BottomNavigation from "./bottom-navigation";

interface AppShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  activePage: "home" | "transactions" | "tools" | "finance-gpt" | "reports" | "settings";
}

export default function AppShell({ children, title, subtitle, activePage }: AppShellProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Status Bar (Mobile) - Visual only */}
      <div className="bg-primary-500 text-white py-2 px-4 flex justify-between items-center">
        <div className="text-xs">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="flex space-x-2 text-xs">
          <i className="ri-signal-wifi-fill"></i>
          <i className="ri-battery-fill"></i>
        </div>
      </div>

      {/* Header */}
      <Navbar title={title} subtitle={subtitle} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activePage={activePage} />
    </div>
  );
}
