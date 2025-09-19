
import React, { useState } from 'react';
import { Customer } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface CustomersViewProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const CustomersView: React.FC<CustomersViewProps> = ({ customers, setCustomers }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && address) {
      const newCustomer: Customer = {
        id: `C${Date.now()}`,
        name,
        address,
        createdAt: Date.now(),
      };
      setCustomers([...customers, newCustomer]);
      setName('');
      setAddress('');
      setIsFormVisible(false);
    }
  };
  
  const deleteCustomer = (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
        setCustomers(customers.filter(c => c.id !== id));
    }
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-dark">Customers</h1>
        <button 
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors duration-200 flex items-center"
        >
          <PlusIcon className="mr-2" />
          {isFormVisible ? 'Cancel' : 'Add Customer'}
        </button>
      </div>

      {isFormVisible && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold text-dark mb-4">New Customer Form</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. John Doe"
                  required
                />
            </div>
            <div className="mb-6">
              <label htmlFor="address" className="block text-gray-700 font-medium mb-2">Address</label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. 123 Water St, Aqua City"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors duration-200"
            >
              Save Customer
            </button>
          </form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-dark mb-4">Customer List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 font-semibold text-gray-800">Customer ID</th>
                <th className="p-4 font-semibold text-gray-800">Name</th>
                <th className="p-4 font-semibold text-gray-800">Address</th>
                <th className="p-4 font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? customers.map(customer => (
                <tr key={customer.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-gray-700">{customer.id}</td>
                  <td className="p-4 text-gray-700">{customer.name}</td>
                  <td className="p-4 text-gray-700">{customer.address}</td>
                  <td className="p-4">
                    <button onClick={() => deleteCustomer(customer.id)} className="text-red-500 hover:text-red-700">
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-gray-500">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomersView;