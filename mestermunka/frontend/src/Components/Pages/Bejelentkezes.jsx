import React, { useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";  // Az átirányításhoz
import "../Stilusok/Bejelentkezes.css";

const Bejelentkezes = () => {
  const [felhasznalonev, setFelhasznalonev] = useState("");
  const [jelszo, setJelszo] = useState("");
  const navigate = useNavigate(); // Az átirányításhoz szükséges hook

  const login = () => {
    Axios.post("http://localhost:5020/login", {
      felhasznalonev: felhasznalonev,
      jelszo: jelszo,
    })
      .then((response) => {
        console.log(response);
        if (response.data.success) {
          alert("Sikeres bejelentkezés!");
          navigate("/fooldal");  // Itt átirányítunk a főoldalra
        } else {
          alert("Hibás felhasználónév vagy jelszó.");
        }
      })
      .catch((error) => {
        console.error("Hiba történt:", error);
        alert("Hiba történt a bejelentkezés közben.");
      });
  };

  return (
    <div className="bejelentkezes-container">
      <h2>Bejelentkezés</h2>
      <div className="bejelentkezes-form">
        <div className="form-group">
          <label htmlFor="felhasznalonev">Felhasználónév:</label>
          <input
            type="text"
            id="felhasznalonev"
            value={felhasznalonev}
            onChange={(e) => setFelhasznalonev(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="jelszo">Jelszó:</label>
          <input
            type="password"
            id="jelszo"
            value={jelszo}
            onChange={(e) => setJelszo(e.target.value)}
            required
          />
        </div>
        <button onClick={login} type="submit">Bejelentkezés</button>
      </div>
    </div>
  );
};

export default Bejelentkezes;
