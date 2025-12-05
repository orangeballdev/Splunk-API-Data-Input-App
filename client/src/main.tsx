import { SplunkThemeProvider } from '@splunk/themes';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './dashboards/Manage';
import HomeContent from './dashboards/Home';
import NewDataInput from './dashboards/NewDataInput';

const dashboardElements = document.querySelectorAll('[data-dashboard]');

dashboardElements.forEach((el) => {
  const dashboardType = el.getAttribute('data-dashboard');
  const renderApp = () => {
    switch (dashboardType) {
      case 'new-data-input':
        return <NewDataInput />;
      case 'home':
        return <Home />;
      case 'home-content':
        return <HomeContent />;
      default:
        return <NewDataInput />;
    }
  };

  ReactDOM.createRoot(el).render(
    <React.StrictMode>
      <SplunkThemeProvider family="enterprise" colorScheme="light" density="compact">
        {renderApp()}
      </SplunkThemeProvider>
    </React.StrictMode>
  );
});
