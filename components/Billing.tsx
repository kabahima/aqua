
import React, { useState, useCallback, useMemo } from 'react';
import { Customer, Meter, Reading, Bill } from '../types';
import { RATE_PER_UNIT } from '../constants';
import { PrintIcon } from './icons';

interface BillingViewProps {
  customers: Customer[];
  meters: Meter[];
  readings: Reading[];
  bills: Bill[];
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
}

const BillingView: React.FC<BillingViewProps> = ({ customers, meters, readings, bills, setBills }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [bill, setBill] = useState<Bill | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateBill = useCallback(() => {
    setError(null);
    setBill(null);

    if (!selectedCustomerId) {
      setError('Please select a customer.');
      return;
    }

    const customerMeters = meters.filter(m => m.customerId === selectedCustomerId);
    if (customerMeters.length === 0) {
      setError('This customer has no meters assigned.');
      return;
    }
    
    // For simplicity, we assume one meter per customer for billing. A real system would handle multiple.
    const meter = customerMeters[0];
    
    const meterReadings = readings
      .filter(r => r.meterId === meter.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (meterReadings.length < 2) {
      setError('At least two readings are required to generate a bill.');
      return;
    }

    const currentReading = meterReadings[0];
    const previousReading = meterReadings[1];

    if (currentReading.value < previousReading.value) {
      setError('Current reading value cannot be less than the previous one.');
      return;
    }

    const consumption = currentReading.value - previousReading.value;
    const amountDue = consumption * RATE_PER_UNIT;

    const newBill: Bill = {
      id: `B${Date.now()}`,
      customerId: selectedCustomerId,
      period: `${new Date(previousReading.date).toLocaleDateString()} - ${new Date(currentReading.date).toLocaleDateString()}`,
      consumption,
      amountDue,
      currentReading,
      previousReading,
      generatedAt: Date.now(),
    };

    setBill(newBill);
    setBills(prevBills => [newBill, ...prevBills]);
  }, [selectedCustomerId, meters, readings, setBills]);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const customerBillHistory = useMemo(() => {
    if (!selectedCustomerId) return [];
    return bills
        .filter(b => b.customerId === selectedCustomerId)
        .sort((a, b) => b.generatedAt - a.generatedAt);
  }, [bills, selectedCustomerId]);


  return (
    <div>
      <h1 className="text-4xl font-bold text-dark mb-8 no-print">Billing</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 no-print">
        <h2 className="text-2xl font-bold text-dark mb-4">Generate Bill</h2>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label htmlFor="customer" className="block text-gray-700 font-medium mb-2">Select Customer</label>
            <select
              id="customer"
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setBill(null);
                setError(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Select a Customer --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button
            onClick={generateBill}
            className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:bg-gray-400"
            disabled={!selectedCustomerId}
          >
            Generate
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 no-print" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {bill && selectedCustomer && (
        <div className="bg-white p-8 rounded-lg shadow-2xl animate-fade-in mb-8 printable-area">
          <div className="border-b-2 border-gray-200 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-extrabold text-primary">WATER BILL</h2>
                <p className="text-gray-500">Bill ID: {bill.id}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">AquaFlow Inc.</p>
                <p className="text-sm text-gray-500 mb-4">123 Aqua Ave, Waterton</p>
                <button
                    onClick={() => window.print()}
                    className="no-print bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center ml-auto"
                >
                    <PrintIcon className="mr-2" />
                    Print Bill
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Billed To</h3>
              <p className="text-lg font-bold text-dark">{selectedCustomer.name}</p>
              <p className="text-gray-600">{selectedCustomer.address}</p>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill Details</h3>
              <p className="text-gray-600"><strong>Billing Period:</strong> {bill.period}</p>
              <p className="text-gray-600"><strong>Date Generated:</strong> {new Date(bill.generatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          <table className="w-full text-left mb-8">
            <thead>
              <tr className="bg-light">
                <th className="p-3 font-semibold text-gray-800">Description</th>
                <th className="p-3 font-semibold text-gray-800 text-center">Date</th>
                <th className="p-3 font-semibold text-gray-800 text-right">Reading (units)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3 text-gray-700">Current Reading</td>
                <td className="p-3 text-center text-gray-700">{new Date(bill.currentReading.date).toLocaleDateString()}</td>
                <td className="p-3 text-right font-mono text-gray-700">{bill.currentReading.value.toFixed(2)}</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 text-gray-700">Previous Reading</td>
                <td className="p-3 text-center text-gray-700">{new Date(bill.previousReading.date).toLocaleDateString()}</td>
                <td className="p-3 text-right font-mono text-gray-700">{bill.previousReading.value.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-full max-w-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Consumption:</span>
                <span className="font-bold text-dark">{bill.consumption.toFixed(2)} units</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Rate per unit:</span>
                <span className="font-bold text-dark">${RATE_PER_UNIT.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-4 bg-light rounded-b-lg px-4 mt-2">
                <span className="text-xl font-bold text-primary">Amount Due:</span>
                <span className="text-xl font-bold text-primary">${bill.amountDue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCustomerId && (
        <div className="bg-white p-6 rounded-lg shadow-md mt-8 no-print">
          <h2 className="text-2xl font-bold text-dark mb-4">
            Bill History for {selectedCustomer?.name}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 font-semibold text-gray-800">Bill ID</th>
                  <th className="p-4 font-semibold text-gray-800">Period</th>
                  <th className="p-4 font-semibold text-gray-800">Amount Due</th>
                  <th className="p-4 font-semibold text-gray-800">Date Generated</th>
                </tr>
              </thead>
              <tbody>
                {customerBillHistory.length > 0 ? (
                  customerBillHistory.map(histBill => (
                    <tr key={histBill.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-mono text-sm text-gray-700">{histBill.id}</td>
                      <td className="p-4 text-gray-700">{histBill.period}</td>
                      <td className="p-4 font-mono text-gray-700">${histBill.amountDue.toFixed(2)}</td>
                      <td className="p-4 text-gray-700">{new Date(histBill.generatedAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center p-6 text-gray-500">
                      No bill history found for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingView;