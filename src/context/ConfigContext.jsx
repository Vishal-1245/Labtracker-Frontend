import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPublicConfig } from '../api/configApi';

// Context holding institutional branding and configurations
const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    collegeName: 'Anurag University',
    departmentName: 'Department of Electronics and Communication Engineering',
    rollNoPattern: '^[0-9]{2}[a-zA-Z]{2}[0-9]{3}[a-zA-Z][0-9]{2}$',
  });
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await getPublicConfig();
        setConfig({
          collegeName: data.collegeName || 'Anurag University',
          departmentName: data.departmentName || 'Department of Electronics and Communication Engineering',
          rollNoPattern: data.rollNoPattern || '^[0-9]{2}[a-zA-Z]{2}[0-9]{3}[a-zA-Z][0-9]{2}$',
        });
      } catch (err) {
        // Fallback to institutional defaults if network fails
        console.warn('Could not load remote config, using defaults:', err);
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ ...config, loadingConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

// Hook for accessing institutional college context
export const useConfig = () => useContext(ConfigContext);
