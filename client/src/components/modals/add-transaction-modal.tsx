import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Category, UserSettings } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";
import { getCurrencySymbol, parseCurrencyString } from "@/lib/currency";

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
  const { translate } = useLanguage();
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  const { data: userSettings, isLoading: settingsLoading } = useQuery<UserSettings>({
    queryKey: ["/api/user/settings"],
  });
  
  // Use the currency utility to get the currency symbol
  const currencySymbol = userSettings?.currency 
    ? getCurrencySymbol(userSettings.currency) 
    : "$";

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
      // Just use the current userSettings directly since we've already loaded it
      const currencyCode = userSettings?.currency || 'USD';
      
      // Parse the input amount string to a number
      const numericAmount = parseCurrencyString(data.amount, currencyCode);
      
      if (numericAmount <= 0) {
        throw new Error(translate("invalidAmountError") || "Invalid amount format");
      }
      
      const res = await apiRequest("POST", "/api/transactions", {
        ...data,
        amount: numericAmount,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: translate("transactionAdded"),
        description: translate("transactionAddedDesc") || "Your transaction has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: translate("error"),
        description: error.message || translate("failedToAddTransaction") || "Failed to add transaction",
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
          <DialogTitle>{translate("addTransaction")}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <FormLabel>{translate("type") || "Transaction Type"}</FormLabel>
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
                  {translate("income")}
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
                  {translate("expense")}
                </Button>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate("amount")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">
                          {currencySymbol}
                        </span>
                      </div>
                      <Input 
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00" 
                        className="pl-7" 
                        value={field.value}
                        onChange={(e) => {
                          // Allow only numbers, decimal point, and backspace
                          const value = e.target.value;
                          const regex = /^[0-9]*\.?[0-9]*$/;
                          if (regex.test(value) || value === '') {
                            field.onChange(value);
                          }
                        }}
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
                  <FormLabel>{translate("category")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={translate("selectCategory") || "Select category"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriesLoading ? (
                        <div className="flex justify-center p-2">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      ) : filteredCategories.length === 0 ? (
                        <div className="p-2 text-center text-sm text-gray-500">
                          {translate("noCategories") || "No categories available"}
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
                  <FormLabel>{translate("date")}</FormLabel>
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
                  <FormLabel>{translate("description")} ({translate("optional") || "Optional"})</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        transactionType === "income"
                          ? translate("incomeExamples") || "Monthly salary, Freelance work..."
                          : translate("expenseExamples") || "Grocery shopping, Rent payment..."
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
                    {translate("loading")}
                  </>
                ) : (
                  translate("addTransaction")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
