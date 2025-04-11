import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Axios from "axios";
import "../Stilusok/Regisztracio.css"; // CSS importálása
import backgroundImage from "../../assets/hatterkep1.png";

const megyek = [
  "Bács-Kiskun", "Baranya", "Békés", "Borsod-Abaúj-Zemplén", "Csongrád-Csanád",
  "Fejér", "Győr-Moson-Sopron", "Hajdú-Bihar", "Heves", "Jász-Nagykun-Szolnok",
  "Komárom-Esztergom", "Nógrád", "Pest", "Somogy", "Szabolcs-Szatmár-Bereg", "Tolna",
  "Vas", "Veszprém", "Zala"
];

const Regisztracio = () => {
  const [vezeteknevReg, setVezeteknevReg] = useState("");
  const [keresztnevReg, setKeresztnevReg] = useState("");
  const [felhasznalonevReg, setFelhasznalonevReg] = useState("");
  const [jelszoReg, setJelszoReg] = useState("");
  const [emailReg, setEmailReg] = useState("");
  const [telefonszamReg, setTelefonszamReg] = useState("");
  const [telepulesReg, setTelepulesReg] = useState("");
  const [munkaltatoReg, setMunkaltatoReg] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[0-9]+$/;
    return phoneRegex.test(phone) && phone.length >= 11;
  };

  const register = () => {
    if (!validateEmail(emailReg)) {
      setErrorMessage("Kérlek, adj meg egy érvényes email címet!");
      return;
    }

    if (!validatePhoneNumber(telefonszamReg)) {
      setErrorMessage("A telefonszám érvénytelen");
      return;
    }

    setErrorMessage("");

    Axios.post(
      "http://localhost:5020/register",
      {
        vezeteknev: vezeteknevReg,
        keresztnev: keresztnevReg,
        felhasznalonev: felhasznalonevReg,
        jelszo: jelszoReg,
        emailcim: emailReg,
        telefonszam: telefonszamReg,
        telepules: telepulesReg,
        munkaltato: munkaltatoReg,
      },
      { withCredentials: true }
    )
      .then(() => {
        setSuccessMessage("Sikeres regisztráció");
        setTimeout(() => {
          navigate("/bejelentkezes");
        }, 1000);
      })
      .catch(() => {
        setErrorMessage("Hiba történt a regisztráció során.");
      });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (/^\+?[0-9]*$/.test(value)) {
      setTelefonszamReg(value);
    }
  };

  return (
    <div className="regisztracio-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="overlay"></div>
      <div className="regisztracio-form">
        <h2>Regisztráció</h2>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>
            {errorMessage}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="vezeteknev">Vezetéknév:<span className="required">*</span></label>
          <input
            type="text"
            id="vezeteknev"
            value={vezeteknevReg}
            onChange={(e) => setVezeteknevReg(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="keresztnev">Keresztnév:<span className="required">*</span></label>
          <input
            type="text"
            id="keresztnev"
            value={keresztnevReg}
            onChange={(e) => setKeresztnevReg(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="felhasznalonev">Felhasználónév:<span className="required">*</span></label>
          <input
            type="text"
            id="felhasznalonev"
            value={felhasznalonevReg}
            onChange={(e) => setFelhasznalonevReg(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="jelszo">Jelszó:<span className="required">*</span></label>
          <input
            type="password"
            id="jelszo"
            value={jelszoReg}
            onChange={(e) => setJelszoReg(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email cím:<span className="required">*</span></label>
          <input
            type="email"
            id="email"
            value={emailReg}
            onChange={(e) => setEmailReg(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="telefonszam">Telefonszám:<span className="required">*</span></label>
          <input
            type="text"
            id="telefonszam"
            value={telefonszamReg}
            onChange={handlePhoneChange}
            placeholder="+36123456789"
          />
        </div>

        <div className="form-group">
          <label htmlFor="telepules">Megye:<span className="required">*</span></label>
          <select
            id="telepules"
            value={telepulesReg}
            onChange={(e) => setTelepulesReg(e.target.value)}
          >
            <option value="">Válassz megyét</option>
            {megyek.map((telepules, index) => (
              <option key={index} value={telepules}>{telepules}</option>
            ))}
          </select>
        </div>

        <div className="form-group checkbox-container">
          <label htmlFor="munkaltato">Munkáltató fiókot szeretnék:</label>
          <input
            type="checkbox"
            id="munkaltato"
            checked={munkaltatoReg}
            onChange={(e) => setMunkaltatoReg(e.target.checked)}
          />
        </div>

        <button onClick={register}>Regisztrálok</button>

        <div className="bejelentkezes-link">
          <p>Már van fiókod? <Link to="/bejelentkezes">Jelentkezz be!</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Regisztracio;