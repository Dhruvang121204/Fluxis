import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AppShell from "@/components/layout/app-shell";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Bot } from "lucide-react";

const questionSchema = z.object({
  question: z.string().min(1, "Please enter your question"),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function FinanceGptPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm FinanceGPT, your AI financial assistant. Ask me anything about personal finance, budgeting, investing, or financial planning.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: "",
    },
  });

  async function onSubmit(data: QuestionFormValues) {
    // Add user message to the chat
    const userMessage: Message = {
      role: "user",
      content: data.question,
    };
    setMessages((prev) => [...prev, userMessage]);
    
    // Clear the input
    form.reset();
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Call the API
      const response = await apiRequest("POST", "/api/finance-gpt", {
        question: data.question,
      });
      
      const result = await response.json();
      
      // Add AI response to the chat
      const aiMessage: Message = {
        role: "assistant",
        content: result.answer,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response from FinanceGPT. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppShell
      title="FinanceGPT"
      subtitle="Your AI financial assistant"
      activePage="finance-gpt"
    >
      <div className="p-4 space-y-4 pb-20">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="h-6 w-6 text-primary mr-2" />
              FinanceGPT Assistant
            </CardTitle>
            <CardDescription>Ask me anything about personal finance, investing, or financial planning</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Chat messages */}
            <div className="space-y-4 mb-4 max-h-[60vh] overflow-y-auto p-2">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-2">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Ask a financial question..."
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="icon" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Questions</CardTitle>
            <CardDescription>Try asking these financial questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {[
                "How do I create a personal budget?",
                "What's the best way to save for retirement?",
                "How can I reduce my debt quickly?",
                "Is it better to save or invest extra money?",
                "How to start investing with small amounts?",
              ].map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto py-2 px-4 text-left"
                  onClick={() => {
                    form.setValue("question", question);
                    form.handleSubmit(onSubmit)();
                  }}
                  disabled={isLoading}
                >
                  {question}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}