import React from 'react';
import { DashboardIcon, UsersIcon, MeterIcon, ReadingIcon, BillingIcon, LockClosedIcon, LogoutIcon, UserManagementIcon } from './icons';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, onLogout }) => {
  const navItems = [
    { name: 'Dashboard', icon: DashboardIcon },
    { name: 'Users', icon: UserManagementIcon },
    { name: 'Customers', icon: UsersIcon },
    { name: 'Meters', icon: MeterIcon },
    { name: 'Readings', icon: ReadingIcon },
    { name: 'Billing', icon: BillingIcon },
    { name: 'User Roles', icon: LockClosedIcon },
  ];

  return (
    <div className="w-64 bg-dark text-white flex flex-col min-h-screen no-print">
      <div className="p-5 text-2xl font-bold border-b border-gray-700 flex items-center">
        <svg className="w-8 h-8 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        AquaFlow
      </div>
      <nav className="flex-1 p-3">
        <ul>
          {navItems.map(item => (
            <li key={item.name}>
              <button
                onClick={() => setActiveView(item.name)}
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
            onClick={onLogout}
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