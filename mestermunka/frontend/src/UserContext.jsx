import { createContext, useState, useEffect } from "react";
import Axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Felhasználói adatok lekérése csak akkor, ha van érvényes munkamenet
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUserID = localStorage.getItem("userID");
        if (storedUserID) { // Ellenőrizzük, hogy van-e mentett userID
          const response = await Axios.get("http://localhost:5020/profile", {
            withCredentials: true,
          });
          if (response.data.success) {
            setUser(response.data.user);
            console.log("🔵 Lekért felhasználó adatok (UserContext):", response.data.user);
          } else {
            setUser(null);
            localStorage.removeItem("userID"); // Ha a szerver szerint nincs munkamenet, töröljük
            console.log("🔴 Nincs érvényes munkamenet, user nullázva");
          }
        }
      } catch (error) {
        console.error("Nem sikerült lekérni a felhasználói adatokat:", error);
        setUser(null);
        localStorage.removeItem("userID"); // Hiba esetén is töröljük
      }
    };

    fetchUser();
  }, []); // Csak egyszer fut le induláskor

  // Bejelentkezés kezelő függvény
  const loginUser = async (userData) => {
    try {
      // Feltételezzük, hogy a userData-ban van egy ID vagy más azonosító
      setUser(userData);
      localStorage.setItem("userID", userData.id || userData.felhasznalonev); // ID vagy felhasználónév mentése
      console.log("🟢 Bejelentkezett user:", userData);

      // Ellenőrzésképpen lekérjük a teljes profilt
      const response = await Axios.get("http://localhost:5020/profile", {
        withCredentials: true,
      });
      if (response.data.success) {
        setUser(response.data.user); // Frissítjük a teljes profillal
        console.log("🔵 Profil frissítve bejelentkezéskor:", response.data.user);
      }
    } catch (error) {
      console.error("Hiba a bejelentkezés közbeni profil lekérésekor:", error);
      setUser(null);
      localStorage.removeItem("userID");
    }
  };

  // Kijelentkezés kezelő függvény
  const logoutUser = async () => {
    try {
      await Axios.post("http://localhost:5020/logout", {}, { withCredentials: true });
      setUser(null);
      localStorage.removeItem("userID");
      console.log("🟡 Sikeres kijelentkezés");
    } catch (error) {
      console.error("Hiba történt a kijelentkezés során:", error);
      setUser(null);
      localStorage.removeItem("userID");
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;