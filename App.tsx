import React, { useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CustomersView from './components/Customers';
import MetersView from './components/Meters';
import ReadingsView from './components/Readings';
import BillingView from './components/Billing';
import UserRolesView from './components/UserRoles';
import UsersView from './components/Users';
import LoginView from './components/Login';
import { Customer, Meter, Reading, Bill, User } from './types';

const initialUsers: User[] = [
    { id: 'U1', name: 'Super Admin', email: 'superadmin@aquaflow.com', password: 'superpassword', role: 'Super Admin (Platform)', createdAt: Date.now() },
    { id: 'U2', name: 'Admin User', email: 'admin@aquaflow.com', password: 'password', role: 'Utility Admin', createdAt: Date.now() },
];


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [activeView, setActiveView] = useState('Dashboard');
  
  const [users, setUsers] = useLocalStorage<User[]>('users', initialUsers);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
  const [meters, setMeters] = useLocalStorage<Meter[]>('meters', []);
  const [readings, setReadings] = useLocalStorage<Reading[]>('readings', []);
  const [bills, setBills] = useLocalStorage<Bill[]>('bills', []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLogin} users={users} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'Dashboard':
        return <Dashboard customers={customers} meters={meters} readings={readings} />;
      case 'Users':
        return <UsersView users={users} setUsers={setUsers} />;
      case 'Customers':
        return <CustomersView customers={customers} setCustomers={setCustomers} />;
      case 'Meters':
        return <MetersView meters={meters} setMeters={setMeters} customers={customers} />;
      case 'Readings':
        return <ReadingsView readings={readings} setReadings={setReadings} meters={meters} customers={customers} />;
      case 'Billing':
        return <BillingView customers={customers} meters={meters} readings={readings} bills={bills} setBills={setBills} />;
      case 'User Roles':
        return <UserRolesView />;
      default:
        return <Dashboard customers={customers} meters={meters} readings={readings} />;
    }
  };

  return (
    <div className="flex bg-light">
      <Sidebar activeView={activeView} setActiveView={setActiveView} onLogout={handleLogout} />
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;