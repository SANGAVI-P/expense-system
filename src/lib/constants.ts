import { TransactionCategory, TransactionType } from "./supabase/transactions";

export const TRANSACTION_CATEGORIES: TransactionCategory[] = ["Food", "Travel", "Bills", "Entertainment", "Salary", "Other"];
export const TRANSACTION_TYPES: TransactionType[] = ["expense", "income"];