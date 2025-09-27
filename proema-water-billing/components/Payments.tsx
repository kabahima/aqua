import React, { useState, useMemo } from 'react';
import { Payment, Bill, Customer, BillStatus, PaymentMethod } from '../types';
import { PlusIcon } from './icons';

const paymentMethods: PaymentMethod[] = ['Cash', 'Mobile Money', 'Card'];

interface PaymentsViewProps {
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  bills: Bill[];
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
  customers: Customer[];
}

const PaymentsView: React.FC<PaymentsViewProps> = ({ payments, setPayments, bills, setBills, customers }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [billId, setBillId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const unpaidBills = useMemo(() => {
    if (!customerId) return [];
    return bills.filter(b => b.customerId === customerId && b.status !== 'Paid');
  }, [bills, customerId]);

  const selectedBill = useMemo(() => {
      return bills.find(b => b.id === billId);
  }, [bills, billId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const paymentAmount = parseFloat(amount);
    if (!customerId || !billId || !paymentAmount || paymentAmount <= 0) {
      setError('Please fill all fields with valid values.');
      return;
    }

    if(selectedBill && paymentAmount > selectedBill.balanceDue) {
        setError(`Payment amount cannot exceed the balance due of UGX ${Math.round(selectedBill.balanceDue).toLocaleString('en-US')}.`);
        return;
    }

    // 1. Create new payment
    const newPayment: Payment = {
      id: `P${Date.now()}`,
      customerId,
      billId,
      amountPaid: paymentAmount,
      paymentDate,
      method,
      createdAt: Date.now(),
    };
    setPayments(prev => [newPayment, ...prev].sort((a,b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()));

    // 2. Find and update the bill
    if (selectedBill) {
      const newAmountPaid = selectedBill.amountPaid + paymentAmount;
      const newBalanceDue = selectedBill.balanceDue - paymentAmount;
      const newStatus: BillStatus = newBalanceDue <= 0.001 ? 'Paid' : 'Partially Paid';
      
      const updatedBill: Bill = {
        ...selectedBill,
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        status: newStatus,
      };

      // 3. Update bills array
      setBills(prevBills => prevBills.map(b => b.id === billId ? updatedBill : b));
    }
    
    // 4. Reset form
    setIsFormVisible(false);
    setCustomerId('');
    setBillId('');
    setAmount('');
    setMethod('Cash');
    setPaymentDate(new Date().toISOString().split('T')[0]);
  };

  const getCustomerName = (cId: string) => customers.find(c => c.id === cId)?.name || 'N/A';
  const getBillPeriod = (bId: string) => bills.find(b => b.id === bId)?.period || 'N/A';

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-dark">Payments</h1>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-primary text-white font-bold py-2 px-3 text-sm sm:px-4 sm:text-base rounded-lg hover:bg-primary-dark transition-colors duration-200 flex items-center"
        >
          <PlusIcon className="mr-2" />
          {isFormVisible ? 'Cancel' : 'Add Payment'}
        </button>
      </div>

      {isFormVisible && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold text-dark mb-4">New Payment Form</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="customer" className="block text-gray-700 font-medium mb-2">Customer</label>
                <select id="customer" value={customerId} onChange={e => { setCustomerId(e.target.value); setBillId(''); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required>
                  <option value="">Select a customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="bill" className="block text-gray-700 font-medium mb-2">Bill to Pay</label>
                <select id="bill" value={billId} onChange={e => setBillId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required disabled={!customerId}>
                  <option value="">Select a bill</option>
                  {unpaidBills.map(b => <option key={b.id} value={b.id}>{`ID: ${b.id.substring(1)} | Period: ${b.period} | Due: UGX ${Math.round(b.balanceDue).toLocaleString('en-US')}`}</option>)}
                </select>
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                 <div>
                    <label htmlFor="amount" className="block text-gray-700 font-medium mb-2">Amount</label>
                    <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} min="1" step="1" max={selectedBill ? Math.round(selectedBill.balanceDue).toString() : undefined} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. 50000" required />
                 </div>
                  <div>
                    <label htmlFor="method" className="block text-gray-700 font-medium mb-2">Payment Method</label>
                    <select id="method" value={method} onChange={e => setMethod(e.target.value as PaymentMethod)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required>
                        {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                 <div>
                    <label htmlFor="date" className="block text-gray-700 font-medium mb-2">Payment Date</label>
                    <input type="date" id="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                 </div>
            </div>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors duration-200">Record Payment</button>
          </form>
        </div>
      )}

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-dark mb-4">Payment History</h2>
        {payments.length > 0 ? (
          <table className="w-full text-left responsive-table">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 font-semibold text-gray-800">Customer</th>
                <th className="p-4 font-semibold text-gray-800">Bill Period</th>
                <th className="p-4 font-semibold text-gray-800">Payment Date</th>
                <th className="p-4 font-semibold text-gray-800">Method</th>
                <th className="p-4 font-semibold text-gray-800 text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id} className="md:border-b md:hover:bg-gray-50">
                  <td className="text-gray-700 md:p-4" data-label="Customer">{getCustomerName(payment.customerId)}</td>
                  <td className="text-gray-700 md:p-4" data-label="Bill Period">{getBillPeriod(payment.billId)}</td>
                  <td className="text-gray-700 md:p-4" data-label="Payment Date">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                  <td className="text-gray-700 md:p-4" data-label="Method">{payment.method}</td>
                  <td className="font-mono text-gray-700 text-right md:p-4" data-label="Amount Paid">UGX {Math.round(payment.amountPaid).toLocaleString('en-US')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center py-6 text-gray-500">No payments recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default PaymentsView;