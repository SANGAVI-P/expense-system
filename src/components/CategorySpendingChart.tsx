import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Transaction } from '@/lib/supabase/transactions';
import { Budget } from '@/lib/supabase/budgets';
import { format, startOfMonth, isSameMonth, parseISO } from 'date-fns';
import { TRANSACTION_CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

interface CategorySpendingChartProps {
  transactions: Transaction[];
  budgets: Budget[];
}

const prepareCategoryData = (transactions: Transaction[], budgets: Budget[]) => {
  const currentMonth = startOfMonth(new Date());
  
  // 1. Calculate actual spending for the current month
  const spendingMap = new Map<string, number>();
  
  transactions.forEach(t => {
    const transactionDate = parseISO(t.transaction_date);
    
    if (t.type === 'expense' && isSameMonth(transactionDate, currentMonth) && t.category) {
      const category = t.category;
      const currentAmount = spendingMap.get(category) || 0;
      spendingMap.set(category, currentAmount + t.amount);
    }
  });

  // 2. Map budgets to categories
  const budgetMap = new Map<string, number>();
  budgets.forEach(b => {
    budgetMap.set(b.category, b.amount);
  });

  // 3. Combine data for chart
  const chartData = TRANSACTION_CATEGORIES
    .filter(category => category !== 'Salary') // Salaries are income, not relevant for expense budgets
    .map(category => ({
      category,
      spending: spendingMap.get(category) || 0,
      budget: budgetMap.get(category) || 0,
    }))
    .filter(item => item.spending > 0 || item.budget > 0); // Only show relevant categories

  return chartData;
};

export function CategorySpendingChart({ transactions, budgets }: CategorySpendingChartProps) {
  const data = useMemo(() => prepareCategoryData(transactions, budgets), [transactions, budgets]);
  
  const currentMonthLabel = format(new Date(), 'MMMM yyyy');

  if (data.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>No expenses or budgets set for {currentMonthLabel}.</p>
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 10,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
          <XAxis 
            dataKey="category" 
            stroke="hsl(var(--foreground))"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="hsl(var(--foreground))"
            tickFormatter={(value) => formatCurrency(value as number)}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
            formatter={(value: number, name: string) => [formatCurrency(value), name === 'spending' ? 'Spent' : 'Budget']}
          />
          <Legend />
          <Bar dataKey="spending" fill="hsl(var(--primary))" name="Spent" />
          <Bar dataKey="budget" fill="hsl(var(--secondary))" name="Budget" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}