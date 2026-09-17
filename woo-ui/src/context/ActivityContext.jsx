import { createContext, useContext, useState } from "react";

const ActivityContext = createContext(null);

export function ActivityProvider({ children }) {
  const [activities, setActivities] = useState([]);

  const addActivity = (type, message, data = null) => {
    setActivities((prev) => [
      {
        id: `${Date.now()}_${Math.random()}`,
        type,
        message,
        data,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 99),
    ]);
  };

  const clearActivities = () => setActivities([]);

  return (
    <ActivityContext.Provider
      value={{ activities, addActivity, clearActivities }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export const useActivity = () => useContext(ActivityContext);
