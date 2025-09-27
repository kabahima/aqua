import React from 'react';
import { DashboardIcon, UsersIcon, MeterIcon, ReadingIcon, BillingIcon, LockClosedIcon, LogoutIcon, UserManagementIcon, LogoIcon, CashIcon, XIcon } from './icons';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onLogout, isSidebarOpen, setIsSidebarOpen }) => {
  const navItems = [
    { name: 'Dashboard', icon: DashboardIcon },
    { name: 'Users', icon: UserManagementIcon },
    { name: 'Customers', icon: UsersIcon },
    { name: 'Meters', icon: MeterIcon },
    { name: 'Readings', icon: ReadingIcon },
    { name: 'Billing', icon: BillingIcon },
    { name: 'Payments', icon: CashIcon },
    { name: 'User Roles', icon: LockClosedIcon },
  ];

  const handleNavigation = (view: string) => {
    setActiveView(view);
    setIsSidebarOpen(false);
  };
  
  const handleLogout = () => {
    onLogout();
    setIsSidebarOpen(false);
  }

  return (
    <div className={`w-64 bg-dark text-white flex flex-col min-h-screen no-print fixed lg:relative inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-30 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <div className="p-5 text-2xl font-bold border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
            <LogoIcon className="w-12 mr-2" />
            Proema
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <XIcon className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-1 p-3">
        <ul>
          {navItems.map(item => (
            <li key={item.name}>
              <button
                onClick={() => handleNavigation(item.name)}
                className={`flex items-center w-full text-left p-3 my-1 rounded-lg transition-colors duration-200 ${
                  activeView === item.name
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="w-6 h-6 mr-3" />
                <span className="font-medium">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-3 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full text-left p-3 rounded-lg transition-colors duration-200 text-red-400 hover:bg-red-500 hover:text-white"
          >
            <LogoutIcon className="w-6 h-6 mr-3" />
            <span className="font-medium">Logout</span>
          </button>
      </div>
    </div>
  );
};

export default Sidebar;