import React, { createContext, useContext, useState, useEffect } from 'react';

const MembershipDataContext = createContext();

export const useMembershipData = () => {
  const context = useContext(MembershipDataContext);
  if (!context) {
    throw new Error('useMembershipData must be used within a MembershipDataProvider');
  }
  return context;
};

export const MembershipDataProvider = ({ children }) => {
  const [isProviderReady, setIsProviderReady] = useState(false);
  const [data, setData] = useState({
    dashboard: null,
    payments: null,
    scheduledPayments: null,
    debts: null,
    plans: null,
    reminders: null,
    applications: null,
    settings: null,
    coupons: null,
    applicationForms: null,
    digitalCard: null,
    paymentInfo: null
  });
  
  const [loading, setLoading] = useState({
    dashboard: false,
    payments: false,
    scheduledPayments: false,
    debts: false,
    plans: false,
    reminders: false,
    applications: false,
    settings: false,
    coupons: false,
    applicationForms: false,
    digitalCard: false,
    paymentInfo: false
  });
  
  const [errors, setErrors] = useState({
    dashboard: null,
    payments: null,
    scheduledPayments: null,
    debts: null,
    plans: null,
    reminders: null,
    applications: null,
    settings: null,
    coupons: null,
    applicationForms: null,
    digitalCard: null,
    paymentInfo: null
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Initialize provider
  useEffect(() => {
    console.log('🚀 MembershipDataProvider initializing');
    setIsProviderReady(true);
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchData = async (endpoint, dataKey) => {
    try {
      setLoading(prev => ({ ...prev, [dataKey]: true }));
      setErrors(prev => ({ ...prev, [dataKey]: null }));

      console.log(`🚀 Fetching ${dataKey} from:`, `${apiUrl}${endpoint}`);
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        headers: getAuthHeaders()
      });

      console.log(`${dataKey} response status:`, response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`${dataKey} error response:`, errorText);
        throw new Error(`Failed to fetch ${dataKey}: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`${dataKey} data received:`, result);
      setData(prev => ({ ...prev, [dataKey]: result.data || result }));
      
    } catch (error) {
      console.error(`🚨 Error fetching ${dataKey}:`, error);
      setErrors(prev => ({ ...prev, [dataKey]: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, [dataKey]: false }));
    }
  };

  const preloadAllData = async () => {
    if (isInitialized || isLoadingAll) return;
    
    setIsLoadingAll(true);
    console.log('🚀 Starting membership data preload...');

    const endpoints = [
      { endpoint: '/membership/dashboard', key: 'dashboard' },
      { endpoint: '/membership/payments', key: 'payments' },
      { endpoint: '/membership/scheduled-payments', key: 'scheduledPayments' },
      { endpoint: '/membership/debts', key: 'debts' },
      { endpoint: '/membership/plans', key: 'plans' },
      { endpoint: '/membership/reminders', key: 'reminders' },
      { endpoint: '/membership/applications', key: 'applications' },
      { endpoint: '/membership/settings', key: 'settings' },
      { endpoint: '/membership/coupons', key: 'coupons' },
      { endpoint: '/membership/application-forms', key: 'applicationForms' },
      { endpoint: '/membership/digital-card', key: 'digitalCard' },
      { endpoint: '/membership/payment-info', key: 'paymentInfo' }
    ];

    // Fetch all data in parallel for better performance
    const fetchPromises = endpoints.map(({ endpoint, key }) => 
      fetchData(endpoint, key).catch(error => {
        console.warn(`Failed to preload ${key}:`, error);
        // Don't throw - we want other data to still load
        return null; // Return null for failed requests
      })
    );

    const results = await Promise.allSettled(fetchPromises);
    const successCount = results.filter(result => result.status === 'fulfilled' && result.value !== null).length;
    
    setIsInitialized(true);
    setIsLoadingAll(false);
    console.log(`✅ Membership data preload completed - ${successCount}/${endpoints.length} endpoints loaded successfully`);
  };

  const refreshData = async (dataKey) => {
    const endpointMap = {
      dashboard: '/membership/dashboard',
      payments: '/membership/payments',
      scheduledPayments: '/membership/scheduled-payments',
      debts: '/membership/debts',
      plans: '/membership/plans',
      reminders: '/membership/reminders',
      applications: '/membership/applications',
      settings: '/membership/settings',
      coupons: '/membership/coupons',
      applicationForms: '/membership/application-forms',
      digitalCard: '/membership/digital-card',
      paymentInfo: '/membership/payment-info'
    };

    if (endpointMap[dataKey]) {
      await fetchData(endpointMap[dataKey], dataKey);
    }
  };

  const updateData = (dataKey, newData) => {
    setData(prev => ({ ...prev, [dataKey]: newData }));
  };

  const clearData = () => {
    setData({
      dashboard: null,
      payments: null,
      scheduledPayments: null,
      debts: null,
      plans: null,
      reminders: null,
      applications: null,
      settings: null,
      coupons: null,
      applicationForms: null,
      digitalCard: null,
      paymentInfo: null
    });
    setIsInitialized(false);
  };

  const value = {
    data,
    loading,
    errors,
    isInitialized,
    isLoadingAll,
    isProviderReady,
    preloadAllData,
    refreshData,
    updateData,
    clearData
  };

  // Show loading state while provider initializes
  if (!isProviderReady) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Initializing...</div>
        <div style={{ color: '#666' }}>Setting up membership data...</div>
      </div>
    );
  }

  return (
    <MembershipDataContext.Provider value={value}>
      {children}
    </MembershipDataContext.Provider>
  );
};

export default MembershipDataContext;
