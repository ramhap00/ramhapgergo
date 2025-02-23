import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import Axios from "axios";
import "../Stilusok/Regisztracio.css";

const Regisztracio = () => {
  const [vezeteknevReg, setVezeteknevReg] = useState("");
  const [keresztnevReg, setKeresztnevReg] = useState("");
  const [felhasznalonevReg, setFelhasznalonevReg] = useState("");
  const [jelszoReg, setJelszoReg] = useState("");
  const [emailReg, setEmailReg] = useState("");
  const [telefonszamReg, setTelefonszamReg] = useState("");
  const [telepulesReg, setTelepulesReg] = useState("");
  const [munkaltatoReg, setMunkaltatoReg] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); 
  const navigate = useNavigate();

  const register = () => {
    Axios.post(
      "http://localhost:5020/register",
      {
        vezeteknev: vezeteknevReg,
        keresztnev: keresztnevReg,
        felhasznalonev: felhasznalonevReg,
        jelszo: jelszoReg,
        email: emailReg,
        telefonszam: telefonszamReg,
        telepules: telepulesReg,
        munkaltato: munkaltatoReg,
      },
      { withCredentials: true }
    )
      .then((response) => {
        if (response.data.success) {
          setSuccessMessage("Sikeres regisztráció! Átirányítunk a bejelentkezéshez."); 

          
          setTimeout(() => {
            navigate("/bejelentkezes"); 
          }, 2000); 
        } else {
          setError(response.data.message || "Valami hiba történt. Kérjük próbáld újra.");
        }
      })
      .catch((error) => {
        console.error("Hiba történt:", error.response ? error.response.data : error.message);
        setError("Hiba történt a regisztráció során.");
      });
  };

  return (
    <div className="regisztracio-container">
      <h2>Regisztráció</h2>
      <div className="regisztracio-form">
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>} {}
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
            onChange={(e) => setMunkaltatoReg(e.target.checked)}
          />
        </div>
        <button onClick={register} type="submit">
          Regisztrálok
        </button>

        {}
        <div className="bejelentkezes-link">
          <p>
            Van már S.O.S. fiókod?{" "}
            <Link to="/bejelentkezes">Akkor jelentkezz be itt!</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Regisztracio;