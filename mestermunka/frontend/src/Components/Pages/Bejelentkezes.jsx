import React, { useState, useContext } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext"; // Importáljuk a context-et
import "../Stilusok/Bejelentkezes.css"

const Bejelentkezes = () => {
  const { loginUser } = useContext(UserContext);
  const [felhasznalonev, setFelhasznalonev] = useState("");
  const [jelszo, setJelszo] = useState("");
  const navigate = useNavigate();

  const login = () => {
    Axios.post(
      "http://localhost:5020/login",
      { felhasznalonev, jelszo },
      { withCredentials: true } // Szükséges a sütik használatához
    )
      .then((response) => {
        if (response.data.success) {
          loginUser(response.data.user);  // Felhasználói adatokat mentjük a context-be
          alert("Sikeres bejelentkezés!");
          navigate(0); // Oldal frissítése, hogy a navbar is frissüljön
        } else {
          alert(response.data.message);
        }
      })
      .catch((error) => {
        console.error("Hiba történt:", error);
        alert("Hiba történt a bejelentkezés közben.");
      });
  };

  return (
    <div>
      <h2>Bejelentkezés</h2>
      <input
        type="text"
        value={felhasznalonev}
        onChange={(e) => setFelhasznalonev(e.target.value)}
        placeholder="Felhasználónév"
      />
      <input
        type="password"
        value={jelszo}
        onChange={(e) => setJelszo(e.target.value)}
        placeholder="Jelszó"
      />
      <button onClick={login}>Bejelentkezés</button>
    </div>
  );
};

export default Bejelentkezes;
