import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './AppLayout';
import MainLayout from '@/components/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import PricingPage from '@/pages/PricingPage';
import BoardPage from '@/pages/BoardPage';
import TableView from '@/pages/TableView';
import CalendarView from '@/pages/CalendarView';
import DashboardView from '@/pages/DashboardView';
import BoardMap from '@/pages/BoardMap';
import WorkspacePage from '@/pages/WorkspacePage';
import ThemesPage from '@/pages/ThemesPage';
import AdminPanel from '@/pages/AdminPanel';

const basePath = import.meta.env.PROD ? '/Project-managment-app' : '';

export const router = createBrowserRouter([
  // All routes wrapped with AppLayout (which includes AuthProvider)
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // Public routes
      { path: 'login', element: <LoginPage /> },
      { path: 'pricing', element: <PricingPage /> },
      
      // Protected routes with sidebar
      {
        path: '',
        element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'calendar', element: <CalendarView /> },
          { path: 'themes', element: <ThemesPage /> },
          { path: 'admin', element: <AdminPanel /> },
          { path: 'workspace/:workspaceId', element: <WorkspacePage /> },
          { path: 'b/:boardId/board', element: <BoardPage /> },
          { path: 'b/:boardId/table', element: <TableView /> },
          { path: 'b/:boardId/calendar', element: <CalendarView /> },
          { path: 'b/:boardId/dashboard', element: <DashboardView /> },
          { path: 'b/:boardId/map', element: <BoardMap /> },
        ],
      },
    ],
  },
], { basename: basePath });