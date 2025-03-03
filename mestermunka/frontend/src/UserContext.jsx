import { createContext, useState, useEffect } from "react";
import Axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Ellenőrizzük, hogy van-e aktív bejelentkezett user a szerveren
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await Axios.get("http://localhost:5020/user", { withCredentials: true });
        if (response.data.success) {
          setUser(response.data.user); // Feltételezve, hogy a szerver válaszban van munkaltato mező
        }
      } catch (error) {
        console.error("Nem sikerült lekérni a felhasználói adatokat:", error.response || error);
      }
    };

    fetchUser();
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
  };

  const logoutUser = () => {
    Axios.post("http://localhost:5020/logout", {}, { withCredentials: true })
      .then(() => {
        setUser(null); // Bejelentkezés törlése
      })
      .catch((error) => {
        console.error("Hiba történt a kijelentkezés során:", error.response || error);
      });
  };

  return (
    <UserContext.Provider value={{ user, setUser, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};
