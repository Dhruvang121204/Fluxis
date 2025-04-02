import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  readTime: string;
}

export default function FinanceNews() {
  const { data: news, isLoading } = useQuery<NewsItem[]>({
    queryKey: ["/api/news"],
  });

  // Format published date
  const formatPublishedDate = (dateString: string) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  };

  // Handle news item click
  const handleNewsClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Finance News</h2>
          <Button variant="link" className="text-primary-500 p-0 h-auto">
            More
          </Button>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            // Loading state
            [...Array(2)].map((_, i) => (
              <div key={i} className="flex">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="ml-3">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))
          ) : news && news.length > 0 ? (
            news.map((item) => (
              <div 
                key={item.id} 
                className="flex cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors"
                onClick={() => handleNewsClick(item.url)}
              >
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ExternalLink className="w-6 h-6 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatPublishedDate(item.publishedAt)} • {item.readTime}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No finance news available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
