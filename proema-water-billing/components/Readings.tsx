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
  
  // States for the consumption calculator
  const [calculatorMeterId, setCalculatorMeterId] = useState<string>('');
  const [startReadingId, setStartReadingId] = useState<string | null>(null);
  const [endReadingId, setEndReadingId] = useState<string | null>(null);


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

  // Memos for the consumption calculator
  const calculatorReadings = useMemo(() => {
    if (!calculatorMeterId) return [];
    return readings
      .filter(r => r.meterId === calculatorMeterId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [readings, calculatorMeterId]);

  const calculationResult = useMemo(() => {
    if (!startReadingId || !endReadingId) return null;

    const startReading = readings.find(r => r.id === startReadingId);
    const endReading = readings.find(r => r.id === endReadingId);

    if (!startReading || !endReading) return { error: "Selected readings could not be found." };
    
    // Allow same reading to be selected to show 0 consumption
    if (startReading.id !== endReading.id) {
        if (new Date(endReading.date) < new Date(startReading.date)) {
            return { error: "End date must be the same as or after the start date." };
        }
        if (endReading.value < startReading.value) {
            return { error: "End reading value cannot be less than the start reading value." };
        }
    }

    const consumption = endReading.value - startReading.value;
    
    return {
        consumption,
        startDate: startReading.date,
        endDate: endReading.date,
        error: null
    };
  }, [startReadingId, endReadingId, readings]);
  
  const resetCalculator = () => {
      setStartReadingId(null);
      setEndReadingId(null);
  };


  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-dark">Readings</h1>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-primary text-white font-bold py-2 px-3 text-sm sm:px-4 sm:text-base rounded-lg hover:bg-primary-dark transition-colors duration-200 flex items-center"
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

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold text-dark mb-4">Consumption Calculator</h2>
          <p className="text-gray-600 mb-4">Select a meter and two readings to calculate the consumption between them.</p>
          <div className="w-full sm:w-1/2 mb-4">
              <label htmlFor="calculatorMeter" className="block text-gray-700 font-medium mb-2">Select Meter</label>
              <select 
                id="calculatorMeter" 
                value={calculatorMeterId} 
                onChange={e => {
                    setCalculatorMeterId(e.target.value);
                    resetCalculator();
                }} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">-- Select a Meter --</option>
                  {meterOptions.map(m => <option key={m.id} value={m.id}>{m.customerName} - {m.serialNumber}</option>)}
              </select>
          </div>
          
          {calculatorMeterId && (
              <div>
                  {calculatorReadings.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto border rounded-lg">
                          <table className="w-full text-left">
                              <thead className="sticky top-0 bg-gray-100 z-10">
                                  <tr>
                                      <th className="p-3 font-semibold text-gray-800">Date</th>
                                      <th className="p-3 font-semibold text-gray-800">Reading</th>
                                      <th className="p-3 font-semibold text-gray-800 text-center">Actions</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {calculatorReadings.map(reading => (
                                      <tr key={reading.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                          <td className="p-3">{new Date(reading.date).toLocaleDateString()}</td>
                                          <td className="p-3 font-mono">{reading.value.toFixed(2)}</td>
                                          <td className="p-3 text-center space-x-2">
                                              <button onClick={() => setStartReadingId(reading.id)} className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${startReadingId === reading.id ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}>Set Start</button>
                                              <button onClick={() => setEndReadingId(reading.id)} className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${endReadingId === reading.id ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}>Set End</button>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  ) : (
                    <p className="text-center py-6 text-gray-500">No readings found for this meter.</p>
                  )}

                  {(startReadingId || endReadingId) && (
                      <div className="mt-4 p-4 bg-light rounded-lg">
                          <h3 className="text-lg font-bold text-dark mb-2">Calculation Result</h3>
                          {calculationResult && calculationResult.error ? (
                              <p className="text-red-600 font-semibold">{calculationResult.error}</p>
                          ) : calculationResult ? (
                              <div>
                                  <p className="text-gray-700">From <span className="font-semibold">{new Date(calculationResult.startDate).toLocaleDateString()}</span> to <span className="font-semibold">{new Date(calculationResult.endDate).toLocaleDateString()}</span></p>
                                  <p className="text-2xl font-bold text-primary mt-1">{calculationResult.consumption.toFixed(2)} <span className="text-lg font-medium text-gray-600">units</span></p>
                              </div>
                          ) : (
                              <p className="text-gray-500">Select a start and end reading to see the result.</p>
                          )}
                           <button onClick={resetCalculator} className="mt-3 text-sm text-gray-600 hover:text-dark">Reset Selection</button>
                      </div>
                  )}
              </div>
          )}
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
          <h2 className="text-2xl font-bold text-dark">Reading History</h2>
          <div className="w-full sm:w-auto">
            <label htmlFor="meterFilter" className="block sm:inline-block mr-2 text-gray-700 mb-1 sm:mb-0">Filter by Meter:</label>
            <select id="meterFilter" value={selectedMeterId} onChange={e => setSelectedMeterId(e.target.value)} className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="all">All Meters</option>
              {meterOptions.map(m => <option key={m.id} value={m.id}>{m.customerName} - {m.serialNumber}</option>)}
            </select>
          </div>
        </div>
          {filteredReadings.length > 0 ? (
            <table className="w-full text-left responsive-table">
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
                {filteredReadings.map(reading => {
                  const meter = meters.find(m => m.id === reading.meterId);
                  const customer = meter ? customers.find(c => c.id === meter.customerId) : null;
                  return (
                    <tr key={reading.id} className="md:border-b md:hover:bg-gray-50">
                      <td className="text-gray-700 md:p-4" data-label="Customer">{customer?.name || 'N/A'}</td>
                      <td className="text-gray-700 md:p-4" data-label="Meter Serial">{meter?.serialNumber || 'N/A'}</td>
                      <td className="text-gray-700 md:p-4" data-label="Date">{new Date(reading.date).toLocaleDateString()}</td>
                      <td className="font-mono text-gray-700 md:p-4" data-label="Reading Value">{reading.value.toFixed(2)}</td>
                       <td className="md:p-4" data-label="Actions">
                          <button onClick={() => deleteReading(reading.id)} className="text-red-500 hover:text-red-700">
                            <TrashIcon />
                          </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-6 text-gray-500">No readings found for the selected meter.</p>
          )}
      </div>
    </div>
  );
};

export default ReadingsView;