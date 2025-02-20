import { createContext, useState, useEffect } from "react";
import Axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Ellenőrizzük, hogy van-e aktív bejelentkezett user a szerveren
  useEffect(() => {
    Axios.get("http://localhost:5020/user", { withCredentials: true })
      .then((response) => {
        if (response.data.success) {
          setUser(response.data.user);
        }
      })
      .catch((error) => {
        console.error("Nem sikerült lekérni a felhasználói adatokat:", error);
      });
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
  };

  const logoutUser = () => {
    Axios.post("http://localhost:5020/logout", {}, { withCredentials: true })
      .then(() => {
        setUser(null);
      })
      .catch((error) => {
        console.error("Hiba történt a kijelentkezés során:", error);
      });
  };

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};
