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
import { CalendarIcon, Upload } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Transaction, TransactionCategory, TransactionType } from "@/lib/supabase/transactions";
import { useTransactions } from "@/hooks/useTransactions";
import { TRANSACTION_CATEGORIES, TRANSACTION_TYPES } from "@/lib/constants";

const categories = TRANSACTION_CATEGORIES;
const types = TRANSACTION_TYPES;

const formSchema = z.object({
  description: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive."),
  type: z.enum(types as [string, ...string[]]), // Zod enum requires a tuple
  category: z.enum(categories as [string, ...string[]]).optional(),
  transaction_date: z.date(),
  receipt: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTransactionFormProps {
  onSuccess: () => void;
  initialData?: Transaction;
}

export function AddTransactionForm({ onSuccess, initialData }: AddTransactionFormProps) {
  const { addTransaction, updateTransaction } = useTransactions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues: FormValues = initialData
    ? {
        description: initialData.description || "",
        amount: initialData.amount,
        type: initialData.type,
        category: (initialData.category as TransactionCategory) || "Other",
        transaction_date: parseISO(initialData.transaction_date),
        receipt: undefined,
      }
    : {
        description: "",
        amount: 0,
        type: "expense",
        category: "Other",
        transaction_date: new Date(),
        receipt: undefined,
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
    const receiptFile = values.receipt?.[0] || null;

    const transactionData = {
      description: values.description || null,
      amount: values.amount,
      type: values.type,
      category: values.category || null,
      transaction_date: format(values.transaction_date, "yyyy-MM-dd"),
    };

    let result = null;

    if (initialData) {
      // Editing existing transaction
      result = await updateTransaction({ id: initialData.id, data: transactionData });
    } else {
      // Adding new transaction
      result = await addTransaction({ data: transactionData, receiptFile });
    }
    
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
          name="transaction_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
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
                <Textarea placeholder="e.g., Dinner with friends" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!initialData && (
          <FormField
            control={form.control}
            name="receipt"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Receipt/Bill (Optional)</FormLabel>
                <FormControl>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="receipt-upload"
                      className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                        <p className="mb-1 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {value && value.length > 0 ? value[0].name : "PNG, JPG, PDF (Max 4MB)"}
                        </p>
                      </div>
                      <Input
                        {...fieldProps}
                        id="receipt-upload"
                        type="file"
                        className="hidden"
                        accept=".png, .jpg, .jpeg, .pdf"
                        onChange={(event) => {
                          onChange(event.target.files);
                        }}
                      />
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Save Transaction")}
        </Button>
      </form>
    </Form>
  );
}