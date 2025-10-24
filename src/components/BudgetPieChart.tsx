import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Budget } from '@/lib/supabase/budgets';
import { formatCurrency } from '@/lib/utils';

interface BudgetPieChartProps {
  budgets: Budget[];
}

// Define a set of colors for the categories
const COLORS = [
  '#8884d8', // Primary Purple
  '#82ca9d', // Secondary Green
  '#ffc658', // Yellow
  '#ff8042', // Orange
  '#0088FE', // Blue
  '#00C49F', // Teal
  '#FFBB28', // Gold
  '#FF8042', // Coral
];

const preparePieData = (budgets: Budget[]) => {
  return budgets.map((budget, index) => ({
    name: budget.category,
    value: budget.amount,
    color: COLORS[index % COLORS.length],
  }));
};

export function BudgetPieChart({ budgets }: BudgetPieChartProps) {
  const data = useMemo(() => preparePieData(budgets), [budgets]);

  if (data.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground h-[300px] flex items-center justify-center">
        <p>No budget data available for this month.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-2 bg-card border border-border rounded-md shadow-lg text-sm">
          <p className="font-semibold">{data.name}</p>
          <p className="text-muted-foreground">{formatCurrency(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}