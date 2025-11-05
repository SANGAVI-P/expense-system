import React, { useState, useMemo } from 'react';
import Header from "@/components/Header";
import { AppFooter } from "@/components/AppFooter";
import { useBudgets } from '@/hooks/useBudgets';
import { format, startOfMonth, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CalendarIcon, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn, formatCurrency } from '@/lib/utils';
import { AddBudgetDialog } from '@/components/AddBudgetDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Budget } from '@/lib/supabase/budgets';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BudgetPieChart } from '@/components/BudgetPieChart';

const Budgets = () => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()));
  const monthKey = format(selectedMonth, 'yyyy-MM-dd');
  
  const { budgets, isLoading, deleteBudget } = useBudgets(monthKey);
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>(undefined);

  const totalBudget = useMemo(() => budgets.reduce((sum, b) => sum + b.amount, 0), [budgets]);

  const handleDelete = async (id: string) => {
    await deleteBudget(id);
  };

  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget);
  };

  const handleMonthChange = (date: Date | undefined) => {
    if (date) {
      setSelectedMonth(startOfMonth(date));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-foreground mb-6 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          Monthly Budgets
        </h2>

        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          {/* Month Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedMonth, "MMMM yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                captionLayout="dropdown-buttons"
                selected={selectedMonth}
                onSelect={handleMonthChange}
                fromYear={2020}
                toYear={new Date().getFullYear() + 1}
              />
            </PopoverContent>
          </Popover>

          {/* Add Budget Button */}
          <AddBudgetDialog 
            month={monthKey} 
            onBudgetSaved={() => setSelectedBudget(undefined)} 
            // Key ensures the dialog resets when the month changes
            key={`add-${monthKey}`}
          />
        </div>

        {/* Budget Visualization and Summary */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Budget Allocation</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]"> {/* Added fixed height here */}
              {isLoading ? (
                <div className="h-full flex items-center justify-center"><Skeleton className="h-full w-full" /></div>
              ) : (
                <BudgetPieChart budgets={budgets} />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Budget Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-lg font-medium">Total Budget Set:</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(totalBudget)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This chart shows how your total budget for {format(selectedMonth, 'MMMM yyyy')} is distributed across different expense categories.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Budget List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Budgets by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : budgets.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <span className="text-5xl mb-4 block">🐖</span>
                <p className="font-semibold">No budgets set for this month.</p>
                <p className="text-sm">Click "Set Budget" to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Budget Amount</TableHead>
                      <TableHead className="text-right w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgets.map((budget) => (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">{budget.category}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(budget.amount)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEdit(budget)}>
                                <Edit className="mr-2 h-4 w-4" />
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the budget for {budget.category}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDelete(budget.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <AppFooter />

      {/* Edit Dialog - Rendered conditionally when a budget is selected for editing */}
      {selectedBudget && (
        <AddBudgetDialog
          initialData={selectedBudget}
          month={monthKey}
          trigger={<></>}
          onBudgetSaved={() => setSelectedBudget(undefined)}
          key={selectedBudget.id}
        />
      )}
    </div>
  );
};

export default Budgets;