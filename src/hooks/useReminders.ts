import { useEffect, useMemo } from 'react';
import { isToday, parseISO, format, startOfMonth, isSameMonth } from 'date-fns';
import { showError, showSuccess } from '@/utils/toast';
import { useRecurringTransactions } from './useRecurringTransactions';
import { useBudgets } from './useBudgets';
import { useTransactions } from './useTransactions';
import { formatCurrency } from '@/lib/utils';

export function useReminders() {
  const { recurringTransactions } = useRecurringTransactions();
  const { transactions } = useTransactions();
  
  const currentMonthKey = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const { budgets } = useBudgets(currentMonthKey);

  // 1. Calculate current month spending by category
  const currentMonthSpending = useMemo(() => {
    const spendingMap = new Map<string, number>();
    const currentMonth = startOfMonth(new Date());

    transactions.forEach(t => {
      const transactionDate = parseISO(t.transaction_date);
      
      if (t.type === 'expense' && isSameMonth(transactionDate, currentMonth) && t.category) {
        const category = t.category;
        const currentAmount = spendingMap.get(category) || 0;
        spendingMap.set(category, currentAmount + t.amount);
      }
    });
    return spendingMap;
  }, [transactions]);

  useEffect(() => {
    // --- Check 1: Recurring Transaction Due Dates ---
    recurringTransactions.forEach(rt => {
      if (rt.is_active) {
        const nextDueDate = parseISO(rt.next_due_date);
        
        // Check if due today or overdue (if next_due_date is in the past)
        if (isToday(nextDueDate) || nextDueDate < new Date()) {
          showSuccess(`Reminder: ${rt.description || rt.category} is due today (${formatCurrency(rt.amount)}).`);
        }
      }
    });

    // --- Check 2: Budget Overruns ---
    budgets.forEach(budget => {
      const spent = currentMonthSpending.get(budget.category) || 0;
      
      if (spent > budget.amount) {
        const overrun = spent - budget.amount;
        showError(`Budget Alert: You have exceeded your ${budget.category} budget by ${formatCurrency(overrun)} this month.`);
      }
    });
  }, [recurringTransactions, budgets, currentMonthSpending]);
}