import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TRANSACTION_CATEGORIES } from "@/lib/constants";
import { useBudgets } from "@/hooks/useBudgets";
import { Budget } from "@/lib/supabase/budgets";
import { format, startOfMonth } from "date-fns";
import { useState } from "react";

const expenseCategories = TRANSACTION_CATEGORIES.filter(c => c !== 'Salary');

const formSchema = z.object({
  category: z.enum(expenseCategories as [string, ...string[]]),
  amount: z.coerce.number().positive("Amount must be positive."),
});

type FormValues = z.infer<typeof formSchema>;

interface BudgetFormProps {
  onSuccess: () => void;
  initialData?: Budget;
  month: string; // YYYY-MM-DD format
}

export function BudgetForm({ onSuccess, initialData, month }: BudgetFormProps) {
  const { upsertBudget } = useBudgets(month);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: FormValues = initialData
    ? {
        category: initialData.category,
        amount: initialData.amount,
      }
    : {
        category: expenseCategories[0],
        amount: 0,
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    const budgetData = {
      id: initialData?.id || null,
      category: values.category,
      amount: values.amount,
      month: month,
    };

    const result = await upsertBudget(budgetData);
    
    setIsSubmitting(false);
    if (result) {
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!initialData}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
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
              <FormLabel>Budget Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="100.00" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : (initialData ? "Update Budget" : "Set Budget")}
        </Button>
      </form>
    </Form>
  );
}