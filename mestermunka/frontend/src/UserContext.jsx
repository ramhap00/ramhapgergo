import { createContext, useState, useEffect } from "react";
import Axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await Axios.get("http://localhost:5020/profile", { withCredentials: true });
        if (response.data.success) {
          setUser(response.data.user);
          console.log("🔵 Lekért felhasználó adatok (UserContext):", response.data.user); // Debug konzol
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Nem sikerült lekérni a felhasználói adatokat:", error);
        setUser(null);
      }
    };

    fetchUser();
  }, []); // Üres függőség, csak egyszer fut le az alkalmazás indulásakor

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