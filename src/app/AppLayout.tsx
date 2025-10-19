import { Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { OrgProvider } from '@/contexts/OrgContext';
import { FilterProvider } from '@/contexts/FilterContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import QuickSwitch from '@/components/QuickSwitch';

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
        <OrgProvider>
          <ThemeProvider>
            <FilterProvider>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <QuickSwitch />
                <Outlet />
              </div>
            </FilterProvider>
          </ThemeProvider>
        </OrgProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}