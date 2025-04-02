import { useState } from "react";
import AppShell from "@/components/layout/app-shell";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
  CardFooter
} from "@/components/ui/card";
import { 
  Bell,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "reminder";
  date: Date;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Welcome to Fluxis!",
      message: "Thank you for using Fluxis. Start tracking your finances today!",
      type: "info",
      date: new Date(Date.now() - 3600000 * 24 * 2), // 2 days ago
      read: false
    },
    {
      id: 2,
      title: "Warning: Spending Limit",
      message: "You've spent 85% of your monthly budget. Consider reducing expenses.",
      type: "warning",
      date: new Date(Date.now() - 3600000 * 36), // 36 hours ago
      read: false
    },
    {
      id: 3,
      title: "Bill Due Tomorrow",
      message: "Your electricity bill payment is due tomorrow. Don't forget to pay!",
      type: "reminder",
      date: new Date(Date.now() - 3600000 * 12), // 12 hours ago
      read: false
    },
    {
      id: 4,
      title: "Transaction Recorded",
      message: "Your recent payment of ₹2,500 to 'Grocery Store' has been recorded.",
      type: "success",
      date: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      read: false
    },
    {
      id: 5,
      title: "New Feature Available",
      message: "Try our new FinanceGPT feature to get personalized financial advice!",
      type: "info",
      date: new Date(), // Just now
      read: false
    }
  ]);

  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
    toast({
      title: "All notifications marked as read",
      description: "All your notifications have been marked as read",
    });
  };

  const deleteNotification = (id: number) => {
    setNotifications(
      notifications.filter(notification => notification.id !== id)
    );
    toast({
      title: "Notification deleted",
      description: "The notification has been removed",
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: "All notifications cleared",
      description: "All your notifications have been deleted",
    });
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case "info": return <Info className="h-6 w-6 text-blue-500" />;
      case "warning": return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case "success": return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "reminder": return <Clock className="h-6 w-6 text-purple-500" />;
      default: return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppShell title="Notifications" subtitle="Stay updated with important alerts" activePage="home">
      <div className="p-4 space-y-4 pb-20">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            {unreadCount > 0 && (
              <Badge variant="outline" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
              Mark all as read
            </Button>
            <Button variant="outline" size="sm" onClick={clearAllNotifications} disabled={notifications.length === 0}>
              Clear all
            </Button>
          </div>
        </div>
        
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium">No Notifications</h3>
              <p className="text-gray-500 mt-2">You don't have any notifications at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card key={notification.id} className={notification.read ? "bg-gray-50 dark:bg-gray-800/50" : ""}>
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <div>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.date)}
                        </span>
                        <div className="flex space-x-2">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}