import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { USER_ROLES } from '../constants';
import { PlusIcon, TrashIcon } from './icons';

interface UsersViewProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const UsersView: React.FC<UsersViewProps> = ({ users, setUsers }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(USER_ROLES[0]);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && password && role) {
      // Check for duplicate email
      if (users.some(user => user.email === email)) {
        alert('A user with this email already exists.');
        return;
      }

      const newUser: User = {
        id: `U${Date.now()}`,
        name,
        email,
        password, // In a real app, this should be hashed
        role,
        createdAt: Date.now(),
      };
      setUsers([...users, newUser]);
      setName('');
      setEmail('');
      setPassword('');
      setRole(USER_ROLES[0]);
      setIsFormVisible(false);
    }
  };
  
  const deleteUser = (id: string) => {
    if (users.length <= 1) {
        alert("You cannot delete the last user.");
        return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
        setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-dark">User Management</h1>
        <button 
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-primary text-white font-bold py-2 px-3 text-sm sm:px-4 sm:text-base rounded-lg hover:bg-primary-dark transition-colors duration-200 flex items-center"
        >
          <PlusIcon className="mr-2" />
          {isFormVisible ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {isFormVisible && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold text-dark mb-4">New User Form</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Jane Smith"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. jane.smith@company.com"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter a secure password"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-gray-700 font-medium mb-2">Role</label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {USER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
            </div>
            <button
              type="submit"
              className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors duration-200"
            >
              Save User
            </button>
          </form>
        </div>
      )}

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-dark mb-4">User List</h2>
        {users.length > 0 ? (
          <table className="w-full text-left responsive-table">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4 font-semibold text-gray-800">Name</th>
                <th className="p-4 font-semibold text-gray-800">Email</th>
                <th className="p-4 font-semibold text-gray-800">Role</th>
                <th className="p-4 font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="md:border-b md:hover:bg-gray-50">
                  <td className="text-gray-700 md:p-4" data-label="Name">{user.name}</td>
                  <td className="text-gray-700 md:p-4" data-label="Email">{user.email}</td>
                  <td className="text-gray-700 md:p-4" data-label="Role">{user.role}</td>
                  <td className="md:p-4" data-label="Actions">
                    <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:text-red-700">
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center py-6 text-gray-500">No users found.</p>
        )}
      </div>
    </div>
  );
};

export default UsersView;