
import React, { useState, useMemo } from 'react';
import { Reading, Meter, Customer } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface ReadingsViewProps {
  readings: Reading[];
  setReadings: React.Dispatch<React.SetStateAction<Reading[]>>;
  meters: Meter[];
  customers: Customer[];
}

const ReadingsView: React.FC<ReadingsViewProps> = ({ readings, setReadings, meters, customers }) => {
  const [meterId, setMeterId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [value, setValue] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedMeterId, setSelectedMeterId] = useState<string | 'all'>('all');
  
  const getCustomerName = (cId: string) => customers.find(c => c.id === cId)?.name || 'N/A';

  const meterOptions = useMemo(() => meters.map(meter => ({
    ...meter,
    customerName: getCustomerName(meter.customerId)
  })).sort((a,b) => a.customerName.localeCompare(b.customerName)), [meters, customers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (meterId && date && value) {
      const newReading: Reading = {
        id: `R${Date.now()}`,
        meterId,
        date,
        value: Number(value),
        createdAt: Date.now(),
      };
      setReadings(prev => [...prev, newReading].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setMeterId('');
      setDate(new Date().toISOString().split('T')[0]);
      setValue('');
      setIsFormVisible(false);
    }
  };

  const deleteReading = (id: string) => {
     if (window.confirm('Are you sure you want to delete this reading?')) {
        setReadings(readings.filter(r => r.id !== id));
    }
  };

  const filteredReadings = useMemo(() => {
    if (selectedMeterId === 'all') return readings;
    return readings.filter(r => r.meterId === selectedMeterId);
  }, [readings, selectedMeterId]);


  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-dark">Readings</h1>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors duration-200 flex items-center"
        >
          <PlusIcon className="mr-2" />
          {isFormVisible ? 'Cancel' : 'Record Reading'}
        </button>
      </div>
      
      {isFormVisible && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold text-dark mb-4">New Reading Form</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label htmlFor="meter" className="block text-gray-700 font-medium mb-2">Meter</label>
                <select id="meter" value={meterId} onChange={e => setMeterId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required>
                  <option value="">Select a meter</option>
                  {meterOptions.map(m => <option key={m.id} value={m.id}>{m.customerName} - {m.serialNumber}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="date" className="block text-gray-700 font-medium mb-2">Date</label>
                <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
              </div>
              <div>
                <label htmlFor="value" className="block text-gray-700 font-medium mb-2">Value (units)</label>
                <input type="number" id="value" value={value} onChange={e => setValue(e.target.value)} min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. 1234.56" required />
              </div>
            </div>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors duration-200">Save Reading</button>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-dark">Reading History</h2>
          <div>
            <label htmlFor="meterFilter" className="mr-2 text-gray-700">Filter by Meter:</label>
            <select id="meterFilter" value={selectedMeterId} onChange={e => setSelectedMeterId(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="all">All Meters</option>
              {meterOptions.map(m => <option key={m.id} value={m.id}>{m.customerName} - {m.serialNumber}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 font-semibold text-gray-800">Customer</th>
                <th className="p-4 font-semibold text-gray-800">Meter Serial</th>
                <th className="p-4 font-semibold text-gray-800">Date</th>
                <th className="p-4 font-semibold text-gray-800">Reading Value</th>
                <th className="p-4 font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReadings.length > 0 ? filteredReadings.map(reading => {
                const meter = meters.find(m => m.id === reading.meterId);
                const customer = meter ? customers.find(c => c.id === meter.customerId) : null;
                return (
                  <tr key={reading.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-700">{customer?.name || 'N/A'}</td>
                    <td className="p-4 text-gray-700">{meter?.serialNumber || 'N/A'}</td>
                    <td className="p-4 text-gray-700">{new Date(reading.date).toLocaleDateString()}</td>
                    <td className="p-4 font-mono text-gray-700">{reading.value.toFixed(2)}</td>
                     <td className="p-4">
                        <button onClick={() => deleteReading(reading.id)} className="text-red-500 hover:text-red-700">
                          <TrashIcon />
                        </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="text-center p-6 text-gray-500">No readings found for the selected meter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReadingsView;