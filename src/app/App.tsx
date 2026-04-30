import './App.css';
import '@blueskyproject/tiled/style.css';

import { FinchConfigProvider } from './FinchConfigProvider';
import MonitorPage from './pages/MonitorPage';
import ControlPage from './pages/ControlPage';
import ScanPage from './pages/ScanPage';
import PlanPage from './pages/PlanPage';
import DataPage from './pages/DataPage';
import AllComponentsPage from './pages/AllComponentsPage';
import TablePVController from '@/components/TablePVController';

import HubAppLayout from '@/components/HubAppLayout';

import { RouteItem } from '@/types/navigationRouterTypes';

import { Television, Joystick, Microscope, StackPlus, ChartBar } from "@phosphor-icons/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  const routes:RouteItem[] = [
    {
      element:<MonitorPage/>, 
      path: "/", 
      label: "Monitor", 
      icon: <Television size={32}/>, 
      isBackgroundTransparent: true
    },
    {
      element: <ControlPage />, 
      path: '/control', 
      label: "Control", 
      icon: <Joystick size={32} />, 
      isBackgroundTransparent: true
    },
    {
      element: <ScanPage />, 
      path: '/scan', 
      label: "Scan", 
      icon: <Microscope size={32} />, 
      isBackgroundTransparent: true
    },
    {
      element: <PlanPage />,
      path: '/plan',
      label: "Plan",
      icon: <StackPlus size={32} />,
    },
    {
      element: <DataPage />,
      path: '/data',
      label: "Data",
      icon: <ChartBar size={32} />,
    },
    {
      element: <AllComponentsPage />,
      path: '/all-components',
      label: "All Components",
      icon: <StackPlus size={32} />,
    },
    {
      element: <TablePVController pvs={['IOC:m1', 'IOC:m2', 'IOC:m3', 'IOC:m4']} />,
      path: '/pv-controller',
      label: "PV Controller",
    }
  ]
  return (
    <FinchConfigProvider
      config={{
        tiledApiUrl: import.meta.env.VITE_TILED_API_URL,
        tiledApiKey: import.meta.env.VITE_TILED_API_KEY,
        ophydApiUrl: import.meta.env.VITE_OPHYD_API_URL,
        qServerApiUrl: import.meta.env.VITE_QSERVER_API_URL,
        qServerApiKey: import.meta.env.VITE_QSERVER_API_KEY,
        finchApiUrl: import.meta.env.VITE_FINCH_API_URL,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <HubAppLayout 
          routes={routes} 
          headerTitle='AMBER' 
          headerLogoIcon={<img src="/images/als_logo_wheel_blue_multicolored.png" alt="ALS Logo" className="h-12 w-12" />} 
        />
      </QueryClientProvider>
    </FinchConfigProvider>
  )

}

export default App
