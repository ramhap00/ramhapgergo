import React, { useState } from "react";
import Axios from "axios";
import "../Stilusok/Regisztracio.css";

const Regisztracio = () => {
  const [vezeteknevReg, setVezeteknevReg] = useState('');
  const [keresztnevReg, setKeresztnevReg] = useState('');
  const [felhasznalonevReg, setFelhasznalonevReg] = useState('');
  const [jelszoReg, setJelszoReg] = useState('');
  const [emailReg, setEmailReg] = useState('');
  const [telefonszamReg, setTelefonszamReg] = useState('');
  const [telepulesReg, setTelepulesReg] = useState('');
  const [munkaltatoReg, setMunkaltatoReg] = useState(false);  // checkbox állapota

  const register = () => {
    Axios.post("http://localhost:5020/register", {
      vezeteknev: vezeteknevReg,
      keresztnev: keresztnevReg,
      felhasznalonev: felhasznalonevReg,
      jelszo: jelszoReg,
      email: emailReg,
      telefonszam: telefonszamReg,
      telepules: telepulesReg,
      munkaltato: munkaltatoReg,  // checkbox értékének továbbítása
    }).then((response) => {
      console.log(response);
      if (response.data.success) {
        alert("Regisztráció sikeres!");
      } else {
        alert("Valami hiba történt. Kérjük próbáld újra.");
      }
    }).catch((error) => {
      console.error("Hiba történt:", error);
      alert("Hiba történt a kérés küldése közben.");
    });
  }

  return (
    <div className="regisztracio-container">
      <h2>Regisztráció</h2>
      <div className="regisztracio-form">
        <div className="form-group">
          <label htmlFor="vezeteknev">Vezetéknév:</label>
          <input
            type="text"
            id="vezeteknev"
            value={vezeteknevReg}
            onChange={(e) => setVezeteknevReg(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="keresztnev">Keresztnév:</label>
          <input
            type="text"
            id="keresztnev"
            value={keresztnevReg}
            onChange={(e) => setKeresztnevReg(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="felhasznalonev">Felhasználónév:</label>
          <input
            type="text"
            id="felhasznalonev"
            value={felhasznalonevReg}
            onChange={(e) => setFelhasznalonevReg(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="jelszo">Jelszó:</label>
          <input
            type="password"
            id="jelszo"
            value={jelszoReg}
            onChange={(e) => setJelszoReg(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email cím:</label>
          <input
            type="email"
            id="email"
            value={emailReg}
            onChange={(e) => setEmailReg(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="telefonszam">Telefonszám:</label>
          <input
            type="tel"
            id="telefonszam"
            value={telefonszamReg}
            onChange={(e) => setTelefonszamReg(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="telepules">Település:</label>
          <input
            type="text"
            id="telepules"
            value={telepulesReg}
            onChange={(e) => setTelepulesReg(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="munkaltato">Munkáltató fiókot szeretnék:</label>
          <input
            type="checkbox"
            id="munkaltato"
            checked={munkaltatoReg}
            onChange={(e) => setMunkaltatoReg(e.target.checked)}  // checkbox állapot kezelése
          />
        </div>
        <button onClick={register} type="submit">Regisztrálok</button>
      </div>
    </div>
  );
};

export default Regisztracio;
