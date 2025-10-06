import React froexport const router = createBrowserRouter([
  // All routes wrapped with AppLayout (which includes AuthProvider)
  {
    path: '/',
    element: <AppLayout />,
    children: [
      // Public routes
      { path: 'login', element: <LoginPage /> },
      { path: 'pricing', element: <PricingPage /> },
      
      // Protected routes  
      { index: true, element: <ProtectedRoute><HomePage /></ProtectedRoute> },
      { path: 'workspace/:workspaceId', element: <ProtectedRoute><WorkspacePage /></ProtectedRoute> },
      { path: 'b/:boardId/board', element: <ProtectedRoute><BoardPage /></ProtectedRoute> },
      { path: 'b/:boardId/table', element: <ProtectedRoute><TableView /></ProtectedRoute> },
      { path: 'b/:boardId/calendar', element: <ProtectedRoute><CalendarView /></ProtectedRoute> },
      { path: 'b/:boardId/dashboard', element: <ProtectedRoute><DashboardView /></ProtectedRoute> },
      { path: 'b/:boardId/map', element: <ProtectedRoute><BoardMap /></ProtectedRoute> },
    ],
  },
], { basename: basePath });createBrowserRouter } from 'react-router-dom';
import AppLayout from './AppLayout';
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

const basePath = import.meta.env.PROD ? '/Project-managment-app' : '';

export const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <LoginPage /> },
  { path: '/pricing', element: <PricingPage /> },
  
  // Protected routes
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <ProtectedRoute><HomePage /></ProtectedRoute> },
      { path: 'workspace/:workspaceId', element: <ProtectedRoute><WorkspacePage /></ProtectedRoute> },
      { path: 'b/:boardId/board', element: <ProtectedRoute><BoardPage /></ProtectedRoute> },
      { path: 'b/:boardId/table', element: <ProtectedRoute><TableView /></ProtectedRoute> },
      { path: 'b/:boardId/calendar', element: <ProtectedRoute><CalendarView /></ProtectedRoute> },
      { path: 'b/:boardId/dashboard', element: <ProtectedRoute><DashboardView /></ProtectedRoute> },
      { path: 'b/:boardId/map', element: <ProtectedRoute><BoardMap /></ProtectedRoute> },
    ],
  },
], {
  basename: basePath,
});