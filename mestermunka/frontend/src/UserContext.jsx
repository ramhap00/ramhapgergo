import { createContext, useState, useEffect } from "react";
import Axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log("🔵 Lekért felhasználó adatok induláskor:", parsedUser);
        }
      } catch (error) {
        console.error("Nem sikerült lekérni a felhasználói adatokat:", error);
        setUser(null);
        localStorage.removeItem("user");
      }
    };

    fetchUser();
  }, []);

  const loginUser = async (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    console.log("🟢 Bejelentkezett user (mentve localStorage-ba):", userData);
  };

  const logoutUser = async () => {
    try {
      await Axios.post("http://localhost:5020/logout", {}, { withCredentials: true });
      setUser(null);
      localStorage.removeItem("user");
      console.log("🟡 Sikeres kijelentkezés");
    } catch (error) {
      console.error("Hiba történt a kijelentkezés során:", error);
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;