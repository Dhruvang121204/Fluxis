import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Category, UserSettings } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";
import { getCurrencySymbol } from "@/lib/currency";

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

const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required").refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  period: z.enum(["weekly", "monthly", "quarterly", "yearly"]),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBudgetModal({ isOpen, onClose }: AddBudgetModalProps) {
  const { toast } = useToast();
  const { translate } = useLanguage();
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  const { data: userSettings, isLoading: settingsLoading } = useQuery<UserSettings>({
    queryKey: ["/api/user/settings"],
  });
  
  // Get currency symbol using our utility function
  const currencySymbol = userSettings?.currency 
    ? getCurrencySymbol(userSettings.currency) 
    : "$";

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: "",
      amount: "",
      period: "monthly",
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        category: "",
        amount: "",
        period: "monthly",
      });
    }
  }, [isOpen, form]);

  const addBudgetMutation = useMutation({
    mutationFn: async (data: BudgetFormValues) => {
      // Ensure the amount is properly parsed as a number, handling currency format
      const cleanAmount = data.amount.replace(/[^\d.-]/g, '');
      const numericAmount = parseFloat(cleanAmount);
      
      if (isNaN(numericAmount)) {
        throw new Error(translate("invalidAmountError") || "Invalid amount format");
      }
      
      const res = await apiRequest("POST", "/api/budgets", {
        ...data,
        amount: numericAmount,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: translate("budgetAdded"),
        description: translate("budgetAddedDesc") || "Your budget has been added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: translate("error"),
        description: error.message || translate("failedToAddBudget") || "Failed to add budget",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: BudgetFormValues) {
    addBudgetMutation.mutate(data);
  }

  // Filter categories to only show expense categories
  const expenseCategories = categories?.filter(
    category => category.type === "expense"
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{translate("addBudget")}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      ) : expenseCategories.length === 0 ? (
                        <div className="p-2 text-center text-sm text-gray-500">
                          {translate("noCategories") || "No categories available"}
                        </div>
                      ) : (
                        expenseCategories.map((category) => (
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate("budgetLimit")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">{currencySymbol}</span>
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
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate("period")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={translate("period")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="weekly">{translate("weekly")}</SelectItem>
                      <SelectItem value="monthly">{translate("monthly")}</SelectItem>
                      <SelectItem value="quarterly">{translate("quarterly")}</SelectItem>
                      <SelectItem value="yearly">{translate("yearly")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={addBudgetMutation.isPending}
              >
                {addBudgetMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {translate("loading")}
                  </>
                ) : (
                  translate("addBudget")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
