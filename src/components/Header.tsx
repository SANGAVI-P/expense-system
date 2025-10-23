import React from 'react';

const Header = () => {
  return (
    <header className="bg-card border-b border-border bg-gradient-to-r from-background/50 to-background/100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-foreground">ExpenseBox</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;