import {createContext, useEffect, useState} from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({children}) {
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);
  const fetchData = async () => {
    try {
      const response = await fetch('/profile', {
          credentials: 'include', 
        });        
        const data = await response.json();
      setId(data.userId);
      setUsername(data.username);
    } catch (error) {
      console.log('Error fetching user profile:', error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <UserContext.Provider value={{username, setUsername, id, setId}}>
      {children}
    </UserContext.Provider>
  );
}