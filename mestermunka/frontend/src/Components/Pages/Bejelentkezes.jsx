import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import Axios from "axios";
import { UserContext } from "../../UserContext";
import "../Stilusok/Bejelentkezes.css";
import backgroundImage from "../../assets/jo.png";
import eyeIcon from "../../assets/password-eye.png"; // Kép importálása

const Bejelentkezes = () => {
  const [felhasznalonev, setFelhasznalonev] = useState("");
  const [jelszo, setJelszo] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleLogin = () => {
    Axios.post(
      "http://localhost:5020/login",
      { felhasznalonev, jelszo },
      { withCredentials: true }
    )
      .then((response) => {
        if (response.data.success) {
          setUser(response.data.user);
          localStorage.setItem("userID", response.data.user);

          console.log("userID mentve:", response.data.user);

          setSuccessMessage("Sikeres bejelentkezés!");
          setTimeout(() => {
            navigate("/Home");
          }, 2000);
        } else {
          setError(response.data.message || "Hibás felhasználónév vagy jelszó");
        }
      })
      .catch((error) => {
        console.error("Hiba történt:", error);
        setError("Hiba történt a bejelentkezés során");
      });
  };

  return (
    <div className="bejelentkezes-page" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="overlay"></div>
      <div className="bejelentkezes-container">
        <h2>Bejelentkezés</h2>
        <div className="bejelentkezes-form">
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          <div className="form-group">
            <label htmlFor="felhasznalonev">Felhasználónév:<span className="required">*</span></label>
            <input
              type="text"
              id="felhasznalonev"
              value={felhasznalonev}
              onChange={(e) => setFelhasznalonev(e.target.value)}
              required
            />
          </div>

          <div className="form-group password-input">
            <label htmlFor="jelszo">Jelszó:<span className="required">*</span></label>
            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                id="jelszo"
                value={jelszo}
                onChange={(e) => setJelszo(e.target.value)}
                required
              />
              <img
                src={eyeIcon}
                alt="Jelszó megjelenítése"
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
          </div>

          <button onClick={handleLogin}>Bejelentkezés</button>

          <div className="regisztracio-link">
            <p>
              Elfelejtettél regisztrálni?{" "}
              <Link to="/regisztracio">Regisztrálj most S.O.S fiókot!</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bejelentkezes;
