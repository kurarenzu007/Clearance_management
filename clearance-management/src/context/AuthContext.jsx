import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

// Mock users for demo
const MOCK_USERS = {
  student: {
    id: 'STU-2024-001',
    name: 'Maria Santos',
    email: 'maria.santos@university.edu',
    role: 'student',
    course: 'BS Computer Science',
    year: '3rd Year',
    section: 'CS-3A',
    avatar: 'MS',
  },
  teacher: {
    id: 'FAC-2024-042',
    name: 'Prof. Juan Dela Cruz',
    email: 'j.delacruz@university.edu',
    role: 'teacher',
    department: 'College of Engineering',
    subjects: ['CS101', 'CS201', 'CS301'],
    avatar: 'JD',
  },
  admin: {
    id: 'ADM-2024-001',
    name: 'Dr. Reyes',
    email: 'admin@university.edu',
    role: 'admin',
    department: 'Registrar',
    avatar: 'DR',
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 900));

      const { role, id, password } = credentials;

      // Demo: accept any password for demo credentials
      if (password !== 'demo123') {
        throw new Error('Invalid credentials. Use password: demo123');
      }

      const mockUser = MOCK_USERS[role];
      if (!mockUser) throw new Error('Invalid role selected');

      setUser(mockUser);
      return mockUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}