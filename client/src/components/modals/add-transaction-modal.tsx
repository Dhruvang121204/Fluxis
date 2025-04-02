import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().min(1, "Amount is required").refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");
  const { toast } = useToast();
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: "",
      category: "",
      date: new Date().toISOString().split('T')[0],
      description: "",
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        type: transactionType,
        amount: "",
        category: "",
        date: new Date().toISOString().split('T')[0],
        description: "",
      });
    }
  }, [isOpen, transactionType, form]);

  // Update form when transaction type changes
  useEffect(() => {
    form.setValue("type", transactionType);
    form.setValue("category", ""); // Reset category when type changes
  }, [transactionType, form]);

  const addTransactionMutation = useMutation({
    mutationFn: async (data: TransactionFormValues) => {
      const res = await apiRequest("POST", "/api/transactions", {
        ...data,
        amount: Number(data.amount),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Transaction added",
        description: "Your transaction has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add transaction",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: TransactionFormValues) {
    addTransactionMutation.mutate(data);
  }

  // Filter categories based on transaction type
  const filteredCategories = categories?.filter(
    category => category.type === transactionType
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <FormLabel>Transaction Type</FormLabel>
              <div className="flex space-x-2 mt-1">
                <Button
                  type="button"
                  className={`flex-1 ${
                    transactionType === "income"
                      ? "bg-success-100 text-success-600"
                      : "bg-gray-100 text-gray-700"
                  }`}
                  variant="outline"
                  onClick={() => setTransactionType("income")}
                >
                  Income
                </Button>
                <Button
                  type="button"
                  className={`flex-1 ${
                    transactionType === "expense"
                      ? "bg-danger-100 text-danger-600"
                      : "bg-gray-100 text-gray-700"
                  }`}
                  variant="outline"
                  onClick={() => setTransactionType("expense")}
                >
                  Expense
                </Button>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">
                          {/* Can be updated to use user's preferred currency */}
                          $
                        </span>
                      </div>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        step="0.01"
                        min="0.01"
                        className="pl-7" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriesLoading ? (
                        <div className="flex justify-center p-2">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      ) : filteredCategories.length === 0 ? (
                        <div className="p-2 text-center text-sm text-gray-500">
                          No categories available
                        </div>
                      ) : (
                        filteredCategories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        transactionType === "income"
                          ? "Monthly salary, Freelance work..."
                          : "Grocery shopping, Rent payment..."
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={addTransactionMutation.isPending}
              >
                {addTransactionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Transaction"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
