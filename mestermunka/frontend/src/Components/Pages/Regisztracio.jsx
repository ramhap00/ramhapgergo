import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Axios from "axios";
import "../Stilusok/Regisztracio.css"; // CSS importálása
import backgroundImage from "../../assets/jo.png";

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
  const navigate = useNavigate();

  const register = () => {
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
        navigate("/bejelentkezes");
      })
      .catch(() => {
        alert("Hiba történt a regisztráció során.");
      });
  };

  return (
    <div className="regisztracio-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="overlay"></div>
      <div className="regisztracio-form">
        <h2>Regisztráció</h2>

        <div className="form-group">
          <label htmlFor="vezeteknev">Vezetéknév:</label>
          <input type="text" id="vezeteknev" value={vezeteknevReg} onChange={(e) => setVezeteknevReg(e.target.value)} />
        </div>

        <div className="form-group">
          <label htmlFor="keresztnev">Keresztnév:</label>
          <input type="text" id="keresztnev" value={keresztnevReg} onChange={(e) => setKeresztnevReg(e.target.value)} />
        </div>

        <div className="form-group">
          <label htmlFor="felhasznalonev">Felhasználónév:</label>
          <input type="text" id="felhasznalonev" value={felhasznalonevReg} onChange={(e) => setFelhasznalonevReg(e.target.value)} />
        </div>

        <div className="form-group">
          <label htmlFor="jelszo">Jelszó:</label>
          <input type="password" id="jelszo" value={jelszoReg} onChange={(e) => setJelszoReg(e.target.value)} />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email cím:</label>
          <input type="email" id="email" value={emailReg} onChange={(e) => setEmailReg(e.target.value)} />
        </div>

        <div className="form-group">
          <label htmlFor="telefonszam">Telefonszám:</label>
          <input type="tel" id="telefonszam" value={telefonszamReg} onChange={(e) => setTelefonszamReg(e.target.value)} />
        </div>

        <div className="form-group">
          <label htmlFor="telepules">Település:</label>
          <select id="telepules" value={telepulesReg} onChange={(e) => setTelepulesReg(e.target.value)}>
            <option value="">Válassz települést</option>
            {megyek.map((telepules, index) => (
              <option key={index} value={telepules}>{telepules}</option>
            ))}
          </select>
        </div>

        <div className="form-group checkbox-container">
          <label htmlFor="munkaltato">Munkáltató fiókot szeretnék:</label>
          <input type="checkbox" id="munkaltato" checked={munkaltatoReg} onChange={(e) => setMunkaltatoReg(e.target.checked)} />
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
