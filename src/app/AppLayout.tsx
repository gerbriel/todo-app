import React from 'react';
import { Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/contexts/AuthContext';
import { FilterProvider } from '@/contexts/FilterContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export default function AppLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FilterProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Outlet />
          </div>
          <ReactQueryDevtools initialIsOpen={false} />
        </FilterProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}