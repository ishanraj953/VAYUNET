import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState({
    state: 'All',
    city: 'All',
    timeRange: '30d',
    searchQuery: ''
  });

  const [metadata, setMetadata] = useState({
    states: ['All'],
    cities: ['All'],
    state_cities: {},
    availableCities: ['All'],
    date_range: { min: '2024-01-01', max: '2024-12-31' },
    total_records: 50000
  });

  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const res = await api.get('/pollution/meta');
      const data = res.data;
      setMetadata({
        states: data.states || ['All'],
        cities: data.cities || ['All'],
        state_cities: data.state_cities || {},
        availableCities: data.cities || ['All'],
        date_range: data.date_range || { min: '2024-01-01', max: '2024-12-31' },
        total_records: data.total_records || 50000
      });
    } catch (e) {
      console.error('Failed to fetch metadata:', e);
    }
  };

  const updateFilter = (key, val) => {
    setFilters(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'state') {
        const stateCities = val === 'All' 
          ? metadata.cities 
          : ['All', ...(metadata.state_cities[val] || [])];
        setMetadata(m => ({ ...m, availableCities: stateCities }));
        next.city = 'All';
      }
      return next;
    });
  };

  const triggerSync = async () => {
    setSyncing(true);
    await fetchMetadata();
    setTimeout(() => {
      setSyncing(false);
    }, 600);
  };

  return (
    <FilterContext.Provider value={{
      filters,
      metadata,
      syncing,
      updateFilter,
      triggerSync
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
