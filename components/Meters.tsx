
import React, { useState } from 'react';
import { Meter, Customer } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface MetersViewProps {
  meters: Meter[];
  setMeters: React.Dispatch<React.SetStateAction<Meter[]>>;
  customers: Customer[];
}

const MetersView: React.FC<MetersViewProps> = ({ meters, setMeters, customers }) => {
  const [customerId, setCustomerId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerId && serialNumber) {
      const newMeter: Meter = {
        id: `M${Date.now()}`,
        customerId,
        serialNumber,
        createdAt: Date.now(),
      };
      setMeters([...meters, newMeter]);
      setCustomerId('');
      setSerialNumber('');
      setIsFormVisible(false);
    }
  };
  
  const deleteMeter = (id: string) => {
    if (window.confirm('Are you sure you want to delete this meter? This will also remove associated readings.')) {
        setMeters(meters.filter(m => m.id !== id));
        // Note: In a real app, you'd also delete readings associated with this meter.
        // The current implementation keeps readings, but they become orphaned.
    }
  };

  const getCustomerName = (cId: string) => {
    const customer = customers.find(c => c.id === cId);
    return customer ? customer.name : 'N/A';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-dark">Meters</h1>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors duration-200 flex items-center"
        >
          <PlusIcon className="mr-2" />
          {isFormVisible ? 'Cancel' : 'Assign Meter'}
        </button>
      </div>

      {isFormVisible && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold text-dark mb-4">New Meter Form</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="customer" className="block text-gray-700 font-medium mb-2">Customer</label>
              <select
                id="customer"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="mb-6">
              <label htmlFor="serial" className="block text-gray-700 font-medium mb-2">Serial Number</label>
              <input
                type="text"
                id="serial"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. SN-12345"
                required
              />
            </div>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors duration-200">
              Save Meter
            </button>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-dark mb-4">Meter List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 font-semibold text-gray-800">Meter ID</th>
                <th className="p-4 font-semibold text-gray-800">Customer</th>
                <th className="p-4 font-semibold text-gray-800">Serial Number</th>
                <th className="p-4 font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {meters.length > 0 ? meters.map(meter => (
                <tr key={meter.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-gray-700">{meter.id}</td>
                  <td className="p-4 text-gray-700">{getCustomerName(meter.customerId)}</td>
                  <td className="p-4 text-gray-700">{meter.serialNumber}</td>
                   <td className="p-4">
                    <button onClick={() => deleteMeter(meter.id)} className="text-red-500 hover:text-red-700">
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-gray-500">No meters found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MetersView;