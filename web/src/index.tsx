import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SimpleDashboard from './pages/SimpleDashboard';
import Dashboard from './pages/Dashboard';
import { QueryClient, QueryClientProvider } from 'react-query';
import './main.css';

// Create a client
const queryClient = new QueryClient();

// Find the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found!');
} else {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<SimpleDashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Dashboard />} />
            <Route path="/content" element={<Dashboard />} />
            <Route path="/metrics" element={<Dashboard />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </React.StrictMode>
  );
  
  console.log('App rendered successfully');
}