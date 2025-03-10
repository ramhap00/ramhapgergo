import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import Axios from "axios";
import "../Stilusok/Regisztracio.css"; // A CSS fájlban lesz a stílus

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
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); 
  const [usernameError, setUsernameError] = useState(""); 
  const [isUsernameChecking, setIsUsernameChecking] = useState(false); 
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false); 
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const validatePhoneNumber = (phone) => {
    const phoneRegex =  /^\+?\d{1,11}$/;
    return phoneRegex.test(phone);
  };
  const checkUsernameAvailability = async () => {
    if (felhasznalonevReg) {
      setIsUsernameChecking(true);  
      try {
        const response = await Axios.post("http://localhost:5020/check-username", { felhasznalonev: felhasznalonevReg });
        if (response.data.exists) {
          setUsernameError("Ez a felhasználónév már foglalt!");
          setIsUsernameAvailable(false); 
        } else {
          setUsernameError("");
          setIsUsernameAvailable(true); 
        }
      } catch (error) {
        setUsernameError("Hiba történt a felhasználónév ellenőrzése során.");
        setIsUsernameAvailable(false); 
      }
      setIsUsernameChecking(false);  
    }
  };

  const register = () => {
    if (!validateEmail(emailReg)) {
      setError("Érvénytelen email cím! Kérlek adj meg egy helyes email címet.");
      return;
    }
    if (!validatePhoneNumber(telefonszamReg)) {
      setError("Érvénytelen telefonszám!");
      return;
    }
    if (!isUsernameAvailable) {
      setError("Kérlek válassz elérhető felhasználónevet!");
      return; 
    }

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
        setError("Hiba történt a regisztráció során.");
      });
  };

  return (
    <div className="regisztracio-container">
      <div className="overlay"></div> {/* Elhomályosított háttér */}
      <div className="regisztracio-form">
        <h2>Regisztráció</h2>
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>} 
        <div className="form-group">
          <label htmlFor="vezeteknev">Vezetéknév:<span className="required">*</span></label>
          <input
            type="text"
            id="vezeteknev"
            value={vezeteknevReg}
            onChange={(e) => setVezeteknevReg(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="keresztnev">Keresztnév:<span className="required">*</span></label>
          <input
            type="text"
            id="keresztnev"
            value={keresztnevReg}
            onChange={(e) => setKeresztnevReg(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="felhasznalonev">Felhasználónév:<span className="required">*</span></label>
          <input
            type="text"
            id="felhasznalonev"
            value={felhasznalonevReg}
            onChange={(e) => {
              setFelhasznalonevReg(e.target.value);
              checkUsernameAvailability(); // Ellenőrizzük a felhasználónevet
            }}
            required
          />
          {usernameError && <div className="error-message">{usernameError}</div>}
        </div>
        <div className="form-group">
          <label htmlFor="jelszo">Jelszó:<span className="required">*</span></label>
          <input
            type="password"
            id="jelszo"
            value={jelszoReg}
            onChange={(e) => setJelszoReg(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email cím:<span className="required">*</span></label>
          <input
            type="email"
            id="email"
            value={emailReg}
            onChange={(e) => setEmailReg(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="telefonszam">Telefonszám:<span className="required">*</span></label>
          <input
            type="tel"
            id="telefonszam"
            value={telefonszamReg}
            onChange={(e) => setTelefonszamReg(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="telepules">Település:<span className="required">*</span></label>
          <select
            id="telepules"
            value={telepulesReg}
            onChange={(e) => setTelepulesReg(e.target.value)}
            required
          >
            <option value="">Válassz települést</option>
            {megyek.map((telepules, index) => (
              <option key={index} value={telepules}>{telepules}</option>
            ))}
          </select>
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
        <button onClick={register} type="submit" disabled={!isUsernameAvailable || isUsernameChecking}>
          Regisztrálok
        </button>

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
