import { TransactionCategory, TransactionType } from "./supabase/transactions";
import { Frequency } from "./supabase/recurringTransactions";

export const TRANSACTION_CATEGORIES: TransactionCategory[] = ["Food", "Travel", "Bills", "Entertainment", "Salary", "Other"];
export const TRANSACTION_TYPES: TransactionType[] = ["expense", "income"];
export const RECURRING_FREQUENCIES: Frequency[] = ["daily", "weekly", "monthly"];