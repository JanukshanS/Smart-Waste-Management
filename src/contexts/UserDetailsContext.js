import React, { createContext, useContext, useState } from 'react';

const UserDetailsContext = createContext();

export const useUserDetails = () => {
  const context = useContext(UserDetailsContext);
  if (!context) {
    throw new Error('useUserDetails must be used within a UserDetailsProvider');
  }
  return context;
};

export const UserDetailsProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState(null);

  const updateUserDetails = (userData) => {
    setUserDetails(userData);
  };

  const clearUserDetails = () => {
    setUserDetails(null);
  };

  const value = {
    userDetails,
    updateUserDetails,
    clearUserDetails,
  };

  return (
    <UserDetailsContext.Provider value={value}>
      {children}
    </UserDetailsContext.Provider>
  );
};

export default UserDetailsContext;
