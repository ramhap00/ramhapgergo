import { createContext, useState, useEffect } from "react";
import Axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await Axios.get("http://localhost:5020/user", { withCredentials: true });
        if (response.data.success) {
          setUser(response.data.user);
          console.log("🔵 Lekért felhasználó adatok:", response.data.user); // Debug konzol
        }
      } catch (error) {
        console.error("Nem sikerült lekérni a felhasználói adatokat:", error);
      }
    };

    fetchUser();
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    console.log("🟢 Bejelentkezett user:", userData); // Debug konzol
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
    <UserContext.Provider value={{ user, setUser, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};
