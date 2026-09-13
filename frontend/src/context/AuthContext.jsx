import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile/');
      setProfile(res.data);
      setUser(res.data.user);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    localStorage.setItem('access_token', res.data.access);
    localStorage.setItem('refresh_token', res.data.refresh);
    await fetchProfile();
    return res.data;
  };

  const register = async (username, email, password, firstName, lastName, selectedSubjectIds = []) => {
    const res = await api.post('/auth/register/', {
      username,
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      selected_subject_ids: selectedSubjectIds,
    });
    localStorage.setItem('access_token', res.data.tokens.access);
    localStorage.setItem('refresh_token', res.data.tokens.refresh);
    setUser(res.data.user);
    setProfile(res.data.profile);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setProfile(null);
  };

  const updateSelectedSubjects = async (subjectIds) => {
    const res = await api.put('/auth/profile/', {
      selected_subject_ids: subjectIds,
    });
    setProfile(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, fetchProfile, updateSelectedSubjects }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
