import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { TransactionCategory, TransactionType } from "@/lib/supabase/transactions";
import { RecurringTransaction, Frequency } from "@/lib/supabase/recurringTransactions";
import { useRecurringTransactions } from "@/hooks/useRecurringTransactions";
import { TRANSACTION_CATEGORIES, TRANSACTION_TYPES, RECURRING_FREQUENCIES } from "@/lib/constants";
import { Switch } from "@/components/ui/switch";

const categories = TRANSACTION_CATEGORIES;
const types = TRANSACTION_TYPES;
const frequencies = RECURRING_FREQUENCIES;

const formSchema = z.object({
  description: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive."),
  type: z.enum(types as [string, ...string[]]),
  category: z.enum(categories as [string, ...string[]]).optional(),
  frequency: z.enum(frequencies as [string, ...string[]]),
  start_date: z.date(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface RecurringTransactionFormProps {
  onSuccess: () => void;
  initialData?: RecurringTransaction;
}

export function RecurringTransactionForm({ onSuccess, initialData }: RecurringTransactionFormProps) {
  const { upsertRecurringTransaction } = useRecurringTransactions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues: FormValues = initialData
    ? {
        description: initialData.description || "",
        amount: initialData.amount,
        type: initialData.type,
        category: (initialData.category as TransactionCategory) || "Other",
        frequency: initialData.frequency,
        start_date: parseISO(initialData.start_date),
        is_active: initialData.is_active,
      }
    : {
        description: "",
        amount: 0,
        type: "expense",
        category: "Other",
        frequency: "monthly",
        start_date: new Date(),
        is_active: true,
      };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Reset form when initialData changes (for dialog reuse)
  useEffect(() => {
    form.reset(defaultValues);
  }, [initialData]);


  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    const startDate = format(values.start_date, "yyyy-MM-dd");
    
    // For simplicity, next_due_date is set to start_date on creation/update.
    // The database function handles subsequent updates.
    const nextDueDate = startDate; 

    const recurringData = {
      id: initialData?.id || null,
      description: values.description || null,
      amount: values.amount,
      type: values.type,
      category: values.category || null,
      frequency: values.frequency,
      start_date: startDate,
      next_due_date: nextDueDate,
      is_active: values.is_active,
    };

    const result = await upsertRecurringTransaction(recurringData);
    
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
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
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
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
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
                <Textarea placeholder="e.g., Netflix subscription" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <p className="text-sm text-muted-foreground">
                  If disabled, this transaction will not be processed automatically.
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Add Recurring Transaction")}
        </Button>
      </form>
    </Form>
  );
}