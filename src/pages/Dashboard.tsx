import React, { useMemo } from 'react';
import Header from "@/components/Header";
import { AppFooter } from "@/components/AppFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ArrowDown, ArrowUp, Wallet } from "lucide-react";
import { SpendingChart } from '@/components/SpendingChart';
import { CategorySpendingChart } from '@/components/CategorySpendingChart';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { formatCurrency } from '@/lib/utils';
import { format, startOfMonth } from 'date-fns';
import { useReminders } from '@/hooks/useReminders';
import { AnimatedCounter } from '@/components/AnimatedCounter';

// Helper function to calculate summary data
const calculateSummary = (transactions: any[]) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  return { totalIncome, totalExpense, netBalance };
};

const Dashboard = () => {
  useReminders(); 

  const { transactions, isLoading: isLoadingTransactions } = useTransactions();
  
  const currentMonthKey = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const { budgets, isLoading: isLoadingBudgets } = useBudgets(currentMonthKey);

  const summary = useMemo(() => calculateSummary(transactions), [transactions]);
  const isLoading = isLoadingTransactions || isLoadingBudgets;

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-foreground mb-6 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          Dashboard
        </h2>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Skeleton loaders */}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="animated-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={summary.netBalance} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Total income minus total expenses
                </p>
              </CardContent>
            </Card>
            <Card className="animated-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <ArrowUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  <AnimatedCounter value={summary.totalIncome} />
                </div>
                <p className="text-xs text-muted-foreground">
                  All income transactions
                </p>
              </CardContent>
            </Card>
            <Card className="animated-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <ArrowDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  <AnimatedCounter value={summary.totalExpense} />
                </div>
                <p className="text-xs text-muted-foreground">
                  All expense transactions
                </p>
              </CardContent>
            </Card>
            <Card className="animated-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={totalBudget} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Total budget for {format(new Date(), 'MMMM')}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Spending Trends (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <SpendingChart transactions={transactions} />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Category Spending vs. Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <CategorySpendingChart transactions={transactions} budgets={budgets} />
            </CardContent>
          </Card>
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default Dashboard;