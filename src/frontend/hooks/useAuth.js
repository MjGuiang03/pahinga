'use client';

import useSWR from 'swr';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const fetcher = (url) => axios.get(url).then(res => res.data);

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR('/api/auth/session', fetcher);
  const router = useRouter();

  const user = data?.user || null;

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    await mutate();
    return res.data;
  };

  const register = async (formData) => {
    const res = await axios.post('/api/auth/register', formData);
    await mutate();
    return res.data;
  };

  const registerAgency = async (formData) => {
    const res = await axios.post('/api/auth/register/agency', formData);
    await mutate();
    return res.data;
  };

  const logout = async () => {
    await axios.post('/api/auth/logout');
    await mutate();
    router.push('/');
  };

  return {
    user,
    isLoading,
    isError: error,
    login,
    register,
    registerAgency,
    logout,
    mutate,
  };
}
