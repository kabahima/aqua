
import React from 'react';
import { Customer, Meter, Reading } from '../types';
import { UsersIcon, MeterIcon, ReadingIcon } from './icons';

interface DashboardProps {
  customers: Customer[];
  meters: Meter[];
  readings: Reading[];
}

const StatCard: React.FC<{ icon: React.ElementType, title: string, value: number, color: string }> = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className={`rounded-full p-3 mr-4 ${color}`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-dark">{value}</p>
    </div>
  </div>
);


const Dashboard: React.FC<DashboardProps> = ({ customers, meters, readings }) => {
  const latestReadings = readings
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);
  
  const getCustomerNameByMeterId = (meterId: string): string => {
    const meter = meters.find(m => m.id === meterId);
    if (!meter) return 'Unknown Meter';
    const customer = customers.find(c => c.id === meter.customerId);
    return customer ? customer.name : 'Unknown Customer';
  };


  return (
    <div>
      <h1 className="text-4xl font-bold text-dark mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard icon={UsersIcon} title="Total Customers" value={customers.length} color="bg-blue-500" />
        <StatCard icon={MeterIcon} title="Total Meters" value={meters.length} color="bg-green-500" />
        <StatCard icon={ReadingIcon} title="Total Readings" value={readings.length} color="bg-yellow-500" />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-dark mb-4">Recent Activity</h2>
        <p className="text-gray-600 mb-6">Here's a look at the most recently added customers and meter readings.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xl font-semibold text-dark mb-4">Latest Readings</h3>
                {latestReadings.length > 0 ? (
                    <ul className="space-y-3">
                        {latestReadings.map(reading => (
                            <li key={reading.id} className="p-3 bg-light rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-dark">{getCustomerNameByMeterId(reading.meterId)}</p>
                                    <p className="text-sm text-gray-500">Meter ID: {reading.meterId}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-primary">{reading.value} units</p>
                                    <p className="text-sm text-gray-500">{new Date(reading.date).toLocaleDateString()}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 italic">No readings recorded yet.</p>
                )}
            </div>
            <div>
                 <h3 className="text-xl font-semibold text-dark mb-4">Newest Customers</h3>
                 {customers.length > 0 ? (
                     <ul className="space-y-3">
                         {customers.slice(-5).reverse().map(customer => (
                             <li key={customer.id} className="p-3 bg-light rounded-md">
                                 <p className="font-semibold text-dark">{customer.name}</p>
                                 <p className="text-sm text-gray-500">{customer.address}</p>
                             </li>
                         ))}
                     </ul>
                 ) : (
                    <p className="text-gray-500 italic">No customers registered yet.</p>
                 )}
            </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
