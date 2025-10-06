import React, { createContext, useContext, useState } from 'react';

interface CardFilters {
  assignee?: string;
  label?: string;
  dueDate?: 'overdue' | 'today' | 'tomorrow' | 'week' | 'month';
  status?: string;
  search?: string;
}

interface FilterOptions {
  enableAssignee: boolean;
  enableLabels: boolean;
  enableDueDate: boolean;
  enableStatus: boolean;
}

interface FilterContextType {
  filters: CardFilters;
  filterOptions: FilterOptions;
  setFilters: (filters: CardFilters) => void;
  setFilterOptions: (options: FilterOptions) => void;
  clearFilters: () => void;
  isFilterActive: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<CardFilters>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    enableAssignee: false,
    enableLabels: false,
    enableDueDate: false,
    enableStatus: false,
  });

  const clearFilters = () => {
    setFilters({});
  };

  const isFilterActive = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  const value = {
    filters,
    filterOptions,
    setFilters,
    setFilterOptions,
    clearFilters,
    isFilterActive,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useCardFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useCardFilters must be used within a FilterProvider');
  }
  return context;
}