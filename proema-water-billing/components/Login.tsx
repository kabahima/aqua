import React, { useState } from 'react';
import { User } from '../types';

interface LoginViewProps {
    onLoginSuccess: () => void;
    users: User[];
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, users }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const foundUser = users.find(user => user.email === email && user.password === password);

        if (foundUser) {
            onLoginSuccess();
        } else {
            setError('Invalid email or password.');
        }
    };

    return (
        <div className="min-h-screen bg-light flex flex-col justify-center items-center">
            <div className="max-w-md w-full mx-auto p-4">
                <div className="text-center mb-8">
                     <div className="flex justify-center items-center mb-4">
                        <svg className="w-16 mr-2" viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="swooshGradientLogin" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style={{ stopColor: '#c3a05c' }} />
                                    <stop offset="100%" style={{ stopColor: '#e9d29b' }} />
                                </linearGradient>
                                <linearGradient id="textGradientLogin" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="50%" style={{ stopColor: '#343a40' }} />
                                    <stop offset="100%" style={{ stopColor: '#c3a05c' }} />
                                </linearGradient>
                            </defs>
                            <path d="M10,70 C40,90 120,90 150,70 C130,80 30,80 10,70" fill="url(#swooshGradientLogin)" />
                            <text 
                                x="20" y="65" 
                                fontFamily="Georgia, serif" 
                                fontSize="60" 
                                fontWeight="bold" 
                                fill="url(#textGradientLogin)"
                                stroke="#007BFF"
                                strokeWidth="1.5"
                                fontStyle="italic"
                                >
                                Pe
                            </text>
                        </svg>
                        <h1 className="text-4xl font-bold text-dark">Proema</h1>
                    </div>
                     <p className="text-gray-500">Please sign in to continue</p>
                </div>
                <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                                <p>{error}</p>
                            </div>
                        )}
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors duration-200"
                        >
                            Login
                        </button>
                    </form>
                </div>
                <p className="text-center text-gray-500 text-sm mt-6">
                    &copy; {new Date().getFullYear()} Proema Inc. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default LoginView;