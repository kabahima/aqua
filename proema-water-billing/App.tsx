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
import PaymentsView from './components/Payments';
import { Customer, Meter, Reading, Bill, User, Payment } from './types';
import { MenuIcon, LogoIcon } from './components/icons';
import { RATE_PER_UNIT } from './constants';

const initialUsers: User[] = [
    { id: 'U1', name: 'Super Admin', email: 'superadmin@proema.com', password: 'superpassword', role: 'Super Admin (Platform)', createdAt: Date.now() },
    { id: 'U2', name: 'Admin User', email: 'admin@proema.com', password: 'password', role: 'Utility Admin', createdAt: Date.now() },
];


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [activeView, setActiveView] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [users, setUsers] = useLocalStorage<User[]>('users', initialUsers);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
  const [meters, setMeters] = useLocalStorage<Meter[]>('meters', []);
  const [readings, setReadings] = useLocalStorage<Reading[]>('readings', []);
  const [bills, setBills] = useLocalStorage<Bill[]>('bills', []);
  const [payments, setPayments] = useLocalStorage<Payment[]>('payments', []);
  const [ratePerUnit, setRatePerUnit] = useLocalStorage<number>('ratePerUnit', RATE_PER_UNIT);


  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLogin} users={users} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'Dashboard':
        return <Dashboard customers={customers} meters={meters} readings={readings} bills={bills} payments={payments} />;
      case 'Users':
        return <UsersView users={users} setUsers={setUsers} />;
      case 'Customers':
        return <CustomersView customers={customers} setCustomers={setCustomers} />;
      case 'Meters':
        return <MetersView meters={meters} setMeters={setMeters} customers={customers} />;
      case 'Readings':
        return <ReadingsView readings={readings} setReadings={setReadings} meters={meters} customers={customers} />;
      case 'Billing':
        return <BillingView customers={customers} meters={meters} readings={readings} bills={bills} setBills={setBills} ratePerUnit={ratePerUnit} setRatePerUnit={setRatePerUnit} />;
      case 'Payments':
        return <PaymentsView payments={payments} setPayments={setPayments} bills={bills} setBills={setBills} customers={customers} />;
      case 'User Roles':
        return <UserRolesView />;
      default:
        return <Dashboard customers={customers} meters={meters} readings={readings} bills={bills} payments={payments}/>;
    }
  };

  return (
    <div className="flex bg-light min-h-screen">
       {/* Backdrop for mobile */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
      
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        <header className="lg:hidden bg-white shadow-md p-4 flex items-center justify-between no-print sticky top-0 z-10">
            <button onClick={() => setIsSidebarOpen(true)} className="text-dark">
              <MenuIcon />
            </button>
            <h1 className="text-lg font-bold text-dark">{activeView}</h1>
            <LogoIcon className="w-8 h-8" />
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;