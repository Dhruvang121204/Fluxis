import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { Bot, MessageSquare, BrainCircuit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function FinancialInsights() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { data: insight, isLoading: insightLoading } = useQuery<{ insight: string }>({
    queryKey: ["/api/insights"],
  });

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await apiRequest("GET", `/api/advice?question=${encodeURIComponent(question)}`);
      const data = await res.json();
      setResponse(data.advice);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get financial advice",
        variant: "destructive",
      });
      setResponse("I'm sorry, I couldn't process your question right now. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
            <BrainCircuit className="w-5 h-5 text-primary-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">FinanceGPT Insights</h2>
        </div>
        
        {insightLoading ? (
          <Skeleton className="h-24 w-full rounded-lg" />
        ) : insight ? (
          <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">💡 Spending Analysis:</span> {insight.insight}
            </p>
          </div>
        ) : (
          <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">💡 Welcome to FinanceGPT!</span> Add some transactions to get personalized financial insights.
            </p>
          </div>
        )}
        
        <div className="mt-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full text-primary-500 border-primary-500">
                <MessageSquare className="w-4 h-4 mr-2" />
                Ask FinanceGPT
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Bot className="w-5 h-5 mr-2" />
                  Ask FinanceGPT
                </DialogTitle>
                <DialogDescription>
                  Get personalized financial advice and answers to your money questions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Ask about budgeting, saving, investing..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAskQuestion();
                    }
                  }}
                />
                {response && (
                  <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
                    <p className="text-sm">{response}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleAskQuestion}
                  disabled={isLoading || !question.trim()}
                >
                  {isLoading ? 'Thinking...' : 'Get Advice'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
