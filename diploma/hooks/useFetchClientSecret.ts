import { useState, useCallback, useEffect } from 'react';
import convertToSubcurrency from '@/functions/convertToSubcurrency';

interface UseClientSecretProps {
  amount: number;
}

interface UseClientSecretResult {
  useClientSecret: string;
  useErrorMessage: string | undefined;
}

const useFetchClientSecret = ({ amount }: UseClientSecretProps): UseClientSecretResult => {
  const [useClientSecret, setClientSecret] = useState('');
  const [useErrorMessage, setErrorMessage] = useState<string>();

  const fetchClientSecret = useCallback(async () => {
    try {
      const response = await fetch('/api/checkout-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching client secret:', errorData);
        setErrorMessage(errorData.message || 'Failed to initialize payment.');
        return;
      }
      const { clientSecret: secret } = await response.json();
      setClientSecret(secret);
    } catch (error: unknown) {
      console.error('Error fetching client secret:', error);
      setErrorMessage('Failed to initialize payment.');
    }
  }, [amount]);

  useEffect(() => {
    fetchClientSecret();
  }, [fetchClientSecret]);

  return { useClientSecret, useErrorMessage };
};

export default useFetchClientSecret;
