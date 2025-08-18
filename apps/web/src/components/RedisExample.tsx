/**
 * Redis Example Component
 * 
 * This component demonstrates how to use Redis in a React/Next.js application.
 * It shows basic Redis operations like setting, getting, and deleting keys.
 * 
 * Location: src/components/RedisExample.tsx
 * Purpose: Example implementation of Redis usage in React components
 */

'use client';

import { useState, useEffect } from 'react';
import { setRedisKey, getRedisKey, deleteRedisKey, testRedisConnection } from '../lib';

export default function RedisExample() {
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [retrievedValue, setRetrievedValue] = useState<string | null>(null);
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Test Redis connection on component mount
    useEffect(() => {
        const testConnection = async () => {
            setIsLoading(true);
            setStatus('Testing Redis connection...');
            
            try {
                await testRedisConnection();
                setStatus('Redis connection successful!');
            } catch (error) {
                setStatus('Redis connection failed. Check console for details.');
                console.error('Redis test error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        testConnection();
    }, []);

    const handleSetKey = async () => {
        if (!key || !value) {
            setStatus('Please enter both key and value');
            return;
        }

        setIsLoading(true);
        setStatus('Setting key...');

        try {
            const success = await setRedisKey(key, value);
            if (success) {
                setStatus(`Successfully set key: ${key}`);
                setRetrievedValue(null); // Clear previous retrieved value
            } else {
                setStatus('Failed to set key');
            }
        } catch (error) {
            setStatus('Error setting key');
            console.error('Set key error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetKey = async () => {
        if (!key) {
            setStatus('Please enter a key to retrieve');
            return;
        }

        setIsLoading(true);
        setStatus('Getting key...');

        try {
            const result = await getRedisKey(key);
            setRetrievedValue(result);
            setStatus(result ? `Retrieved value for key: ${key}` : `Key not found: ${key}`);
        } catch (error) {
            setStatus('Error getting key');
            console.error('Get key error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteKey = async () => {
        if (!key) {
            setStatus('Please enter a key to delete');
            return;
        }

        setIsLoading(true);
        setStatus('Deleting key...');

        try {
            const success = await deleteRedisKey(key);
            if (success) {
                setStatus(`Successfully deleted key: ${key}`);
                setRetrievedValue(null);
            } else {
                setStatus('Failed to delete key or key does not exist');
            }
        } catch (error) {
            setStatus('Error deleting key');
            console.error('Delete key error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-blue-900 mb-2">Redis Connection Status</h2>
                <p className="text-blue-700">{status}</p>
                {isLoading && (
                    <div className="mt-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Redis Operations</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-1">
                            Key
                        </label>
                        <input
                            type="text"
                            id="key"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter key"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                            Value
                        </label>
                        <input
                            type="text"
                            id="value"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter value"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={handleSetKey}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Set Key
                    </button>
                    
                    <button
                        onClick={handleGetKey}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Get Key
                    </button>
                    
                    <button
                        onClick={handleDeleteKey}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Delete Key
                    </button>
                </div>

                {retrievedValue !== null && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Retrieved Value:</h3>
                        <p className="text-gray-900 font-mono bg-white p-2 rounded border">
                            {retrievedValue}
                        </p>
                    </div>
                )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Usage Notes</h3>
                <ul className="text-yellow-800 text-sm space-y-1">
                    <li>• This component demonstrates basic Redis operations</li>
                    <li>• Keys and values are stored as strings</li>
                    <li>• Check the browser console for detailed error messages</li>
                    <li>• Redis connection is tested on component mount</li>
                </ul>
            </div>
        </div>
    );
}
