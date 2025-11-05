import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Budget } from '@/lib/supabase/budgets';
import { formatCurrency } from '@/lib/utils';

interface BudgetPieChartProps {
  budgets: Budget[];
}

// Define a consistent color palette
const COLORS = [
  'hsl(260 70% 50%)', // Primary Purple
  'hsl(142 71% 45%)', // Green
  'hsl(48 96% 50%)',  // Yellow
  'hsl(210 40% 98%)', // Light Gray
  'hsl(0 84% 60%)',   // Red
  'hsl(200 50% 50%)', // Blue
  'hsl(300 50% 50%)', // Magenta
  'hsl(100 50% 50%)', // Lime
];

const prepareChartData = (budgets: Budget[]) => {
  return budgets.map((budget, index) => ({
    name: budget.category,
    value: budget.amount,
    color: COLORS[index % COLORS.length],
  }));
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-card border border-border rounded-md shadow-lg text-sm">
        <p className="font-semibold">{data.name}</p>
        <p className="text-muted-foreground">Budget: {formatCurrency(data.value)}</p>
      </div>
    );
  }
  return null;
};

export function BudgetPieChart({ budgets }: BudgetPieChartProps) {
  const data = useMemo(() => prepareChartData(budgets), [budgets]);

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>No budgets set for this month to display in the chart.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full"> {/* Use h-full to fill parent container */}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            // Ensure fill is set, although cells override it
            fill="hsl(var(--primary))" 
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