import { useState, useEffect } from 'react';
import type { ServerStatus } from '../types';
import { apiService } from '../services/api';

export const useServerStatus = () => {
  const [status, setStatus] = useState<ServerStatus>('checking');
  const [error, setError] = useState('');

  const checkServerStatus = async () => {
    setStatus('checking');
    setError('');
    
    try {
      const response = await apiService.checkHealth();
      if (response.status === 'OK') {
        setStatus('online');
      }
    } catch (error) {
      setStatus('offline');
      setError('Server is not running. Please start the backend server.');
    }
  };

  useEffect(() => {
    checkServerStatus();
  }, []);

  return {
    status,
    error,
    checkServerStatus
  };
};