import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Transaction } from '@/lib/supabase/transactions';
import { subDays, format, parseISO } from 'date-fns';

interface SpendingChartProps {
  transactions: Transaction[];
}

// Prepare data for the chart: aggregate expenses by date for the last 30 days
const prepareChartData = (transactions: Transaction[]) => {
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  
  const dailyExpenses = new Map<string, number>();

  // Initialize map for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = subDays(today, i);
    dailyExpenses.set(format(date, 'yyyy-MM-dd'), 0);
  }

  // Aggregate expenses
  transactions.forEach(t => {
    const date = parseISO(t.transaction_date);
    const dateKey = format(date, 'yyyy-MM-dd');

    if (t.type === 'expense' && date >= thirtyDaysAgo) {
      const currentAmount = dailyExpenses.get(dateKey) || 0;
      dailyExpenses.set(dateKey, currentAmount + t.amount);
    }
  });

  // Convert map to array and sort by date
  const chartData = Array.from(dailyExpenses.entries())
    .map(([date, amount]) => ({
      date: format(parseISO(date), 'MMM dd'),
      expense: amount,
    }))
    .sort((a, b) => (parseISO(a.date) > parseISO(b.date) ? 1 : -1));

  return chartData;
};

export function SpendingChart({ transactions }: SpendingChartProps) {
  const data = useMemo(() => prepareChartData(transactions), [transactions]);

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--foreground))"
            tickFormatter={(value, index) => (index % 5 === 0 ? value : '')}
          />
          <YAxis 
            stroke="hsl(var(--foreground))"
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Expense']}
          />
          <Line 
            type="monotone" 
            dataKey="expense" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2} 
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}