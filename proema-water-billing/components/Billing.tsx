import React, { useState, useCallback, useMemo } from 'react';
import { Customer, Meter, Reading, Bill, BillStatus } from '../types';
import { PrintIcon, SettingsIcon } from './icons';

interface BillingViewProps {
  customers: Customer[];
  meters: Meter[];
  readings: Reading[];
  bills: Bill[];
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
  ratePerUnit: number;
  setRatePerUnit: (rate: number) => void;
}

type DisplayStatus = BillStatus | 'Overdue';

const getStatusBadge = (status: DisplayStatus) => {
    switch (status) {
        case 'Paid':
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{status}</span>;
        case 'Partially Paid':
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">{status}</span>;
        case 'Pending':
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{status}</span>;
        case 'Overdue':
             return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">{status}</span>;
        default:
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
};

const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default due date is 30 days from now
    return date.toISOString().split('T')[0];
};


const BillingView: React.FC<BillingViewProps> = ({ customers, meters, readings, bills, setBills, ratePerUnit, setRatePerUnit }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [dueDate, setDueDate] = useState(getDefaultDueDate());
  const [bill, setBill] = useState<Bill | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [currentRate, setCurrentRate] = useState(ratePerUnit.toString());
  const [successMessage, setSuccessMessage] = useState('');

  const handleRateSave = () => {
    const newRate = parseFloat(currentRate);
    if (!isNaN(newRate) && newRate >= 0) {
      setRatePerUnit(newRate);
      setSuccessMessage('Rate updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      alert('Please enter a valid, non-negative number for the rate.');
    }
  };

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
    const amountDue = consumption * ratePerUnit;

    const newBill: Bill = {
      id: `B${Date.now()}`,
      customerId: selectedCustomerId,
      period: `${new Date(previousReading.date).toLocaleDateString()} - ${new Date(currentReading.date).toLocaleDateString()}`,
      consumption,
      amountDue,
      currentReading,
      previousReading,
      status: 'Pending',
      amountPaid: 0,
      balanceDue: amountDue,
      generatedAt: Date.now(),
      dueDate: dueDate,
    };

    setBill(newBill);
    setBills(prevBills => [newBill, ...prevBills]);
  }, [selectedCustomerId, meters, readings, setBills, dueDate, ratePerUnit]);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const customerBillHistory = useMemo(() => {
    if (!selectedCustomerId) return [];
    return bills
        .filter(b => b.customerId === selectedCustomerId)
        .sort((a, b) => b.generatedAt - a.generatedAt);
  }, [bills, selectedCustomerId]);
  
  const meterSerialNumber = useMemo(() => {
    if (!bill) return 'N/A';
    const meter = meters.find(m => m.id === bill.currentReading.meterId);
    return meter ? meter.serialNumber : 'N/A';
  }, [bill, meters]);


  return (
    <div>
      <div className="flex justify-between items-center mb-8 no-print">
        <h1 className="text-3xl lg:text-4xl font-bold text-dark">Billing</h1>
        <button
          onClick={() => setIsSettingsVisible(!isSettingsVisible)}
          className="text-primary hover:text-primary-dark font-medium flex items-center py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
          aria-controls="billing-settings-panel"
          aria-expanded={isSettingsVisible}
        >
          <SettingsIcon className="w-5 h-5 mr-2" />
          Billing Settings
        </button>
      </div>
      
      {isSettingsVisible && (
        <div id="billing-settings-panel" className="bg-white p-6 rounded-lg shadow-md mb-8 no-print animate-fade-in">
          <h2 className="text-2xl font-bold text-dark mb-4">Set Cost Per Unit</h2>
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
              <p>{successMessage}</p>
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="ratePerUnit" className="block text-gray-700 font-medium mb-2">Cost Per Unit (UGX per m³)</label>
            <input
              type="number"
              id="ratePerUnit"
              value={currentRate}
              onChange={(e) => setCurrentRate(e.target.value)}
              min="0" step="1"
              className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={handleRateSave}
            className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors duration-200"
          >
            Save Rate
          </button>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8 no-print">
        <h2 className="text-2xl font-bold text-dark mb-4">Generate Bill</h2>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-full sm:flex-1">
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
          <div className="w-full sm:flex-1">
            <label htmlFor="dueDate" className="block text-gray-700 font-medium mb-2">Due Date</label>
            <input type="date" id="dueDate" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
          </div>
          <button
            onClick={generateBill}
            className="w-full sm:w-auto bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:bg-gray-400"
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
         <div className="bg-white p-4 sm:p-8 rounded-lg shadow-lg mb-8 printable-area font-sans text-black text-sm">
            {/* Header */}
            <div className="text-center mb-4">
                <h2 className="text-lg font-bold">PROEMA ENTERPRISES LTD</h2>
                <h3 className="text-md font-bold">KALONGA WATER SUPPLY</h3>
                <p>Location: Plot 14 Kasambya House, Mubende Park Lane</p>
                <p>P.O. Box ........ Mubende</p>
                <p>Dealers in Plumbing Materials</p>
                <p>TIN NO: 1016897460</p>
                <p>Tel: 0772 306 976 / 0701 306 976</p>
            </div>
            
            <div className="relative text-center border-t border-b border-dotted border-black my-2 py-1">
                <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 font-bold">Receipt</span>
            </div>
            
            {/* Customer Details */}
            <div className="mt-4 mb-4">
                <p><span className="font-bold">Name:</span> {selectedCustomer.name}</p>
            </div>
    
            <div className="border border-black">
                <div className="flex border-b border-black">
                    <div className="w-2/3 p-1 border-r border-black">
                        <p><span className="font-bold">TO:</span> {selectedCustomer.address}</p>
                    </div>
                    <div className="w-1/3 p-1">
                        <p><span className="font-bold">INVOICE DATE:</span> {new Date(bill.generatedAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex">
                    <div className="w-2/3 p-1 border-r border-black h-6">
                        {/* Empty cell */}
                    </div>
                    <div className="w-1/3 p-1">
                        <p><span className="font-bold">CUSTOMER NO.:</span> {selectedCustomer.id}</p>
                    </div>
                </div>
            </div>
    
            {/* Basis of Charges */}
            <div className="mt-4">
                <p className="font-bold">BASIS OF CHARGES</p>
                <p>Domestic Metered</p>
                <p>Meter Serial No.: {meterSerialNumber}</p>
                <p>Date Read: {new Date(bill.currentReading.date).toLocaleDateString()}</p>
                <div className="flex space-x-4">
                    <p><span className="font-bold">Reading:</span></p>
                    <p>Current: {bill.currentReading.value.toFixed(2)}</p>
                    <p>Previous: {bill.previousReading.value.toFixed(2)}</p>
                    <p>Consumption: {bill.consumption.toFixed(2)}</p>
                </div>
            </div>
            
            {/* Charging Details */}
            <div className="mt-4">
                <p className="font-bold">CHARGING DETAILS</p>
                <table className="w-full border-collapse border border-black">
                    <tbody>
                        <tr className="border-b border-black">
                            <td className="p-1 border-r border-black">Balance B/F from Previous Invoice</td>
                            <td className="p-1 text-right">{Number(0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-1 border-r border-black">Payments Since Previous Invoice</td>
                            <td className="p-1 text-right">{Number(0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-1 border-r border-black">Adjustments Since Previous Invoice</td>
                            <td className="p-1 text-right">{Number(0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-1 border-r border-black font-bold">CURRENT CHARGES</td>
                            <td className="p-1 text-right">{bill.amountDue.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-1 border-r border-black pl-4">Water ({bill.consumption.toFixed(2)}m³ @ {ratePerUnit.toLocaleString('en-US')} Ush)</td>
                            <td className="p-1 text-right"></td>
                        </tr>
                        <tr>
                            <td className="p-1 border-r border-black font-bold text-base">TOTAL AMOUNT DUE</td>
                            <td className="p-1 text-right font-bold text-base">{bill.amountDue.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
    
            {/* Footer */}
            <div className="mt-4 text-center">
                <p className="font-bold italic">SEE OVERLEAF FOR HOW & WHERE TO PAY</p>
            </div>
            
            <div className="mt-4 text-right no-print">
                 <button
                    onClick={() => window.print()}
                    className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors duration-200 flex items-center ml-auto"
                >
                    <PrintIcon className="mr-2" />
                    Print Bill
                </button>
            </div>
        </div>
      )}

      {selectedCustomerId && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mt-8 no-print">
          <h2 className="text-2xl font-bold text-dark mb-4">
            Bill History for {selectedCustomer?.name}
          </h2>
          {customerBillHistory.length > 0 ? (
            <table className="w-full text-left responsive-table">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 font-semibold text-gray-800">Bill ID</th>
                  <th className="p-4 font-semibold text-gray-800">Period</th>
                  <th className="p-4 font-semibold text-gray-800">Amount Due</th>
                  <th className="p-4 font-semibold text-gray-800">Due Date</th>
                  <th className="p-4 font-semibold text-gray-800">Status</th>
                  <th className="p-4 font-semibold text-gray-800">Date Generated</th>
                </tr>
              </thead>
              <tbody>
                {customerBillHistory.map(histBill => {
                  const isOverdue = new Date() > new Date(histBill.dueDate) && histBill.status !== 'Paid';
                  const displayStatus: DisplayStatus = isOverdue ? 'Overdue' : histBill.status;
                  return (
                      <tr key={histBill.id} className="md:border-b md:hover:bg-gray-50">
                        <td className="font-mono text-sm text-gray-700 md:p-4" data-label="Bill ID">{histBill.id}</td>
                        <td className="text-gray-700 md:p-4" data-label="Period">{histBill.period}</td>
                        <td className="font-mono text-gray-700 md:p-4" data-label="Amount Due">UGX {Math.round(histBill.amountDue).toLocaleString('en-US')}</td>
                        <td className="text-gray-700 md:p-4" data-label="Due Date">{new Date(histBill.dueDate).toLocaleDateString()}</td>
                        <td className="md:p-4" data-label="Status">{getStatusBadge(displayStatus)}</td>
                        <td className="text-gray-700 md:p-4" data-label="Date Generated">{new Date(histBill.generatedAt).toLocaleDateString()}</td>
                      </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-6 text-gray-500">
              No bill history found for this customer.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BillingView;