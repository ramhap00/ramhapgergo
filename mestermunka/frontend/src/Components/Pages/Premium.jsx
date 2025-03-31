import React from "react";
import "../Stilusok/Premium.css";
import { Link } from "react-router-dom";
import profileBlank from "../../assets/profile-blank.png";

const Premium = () => {
  return (
    <div className="account-settings">
      <aside className="sidebar">
        <ul>
          <li className="active">
            <img src={profileBlank} alt="icon" className="menu-icon" />
            <Link to="/fiok" style={{ textDecoration: "none", color: "inherit" }}>
            Fiók beállítások
            </Link>
          </li>
          <br />
          <li style={{ fontWeight: "700", fontSize: "16px" }}>
            <img src={profileBlank} alt="icon" className="menu-icon" />
            <Link to="/jelszo" style={{ textDecoration: "none", color: "inherit" }}>
              Jelszó és biztonság
            </Link>
          </li>
          <br />
          <li style={{ fontWeight: "700", fontSize: "16px" }}>
            <img src={profileBlank} alt="icon" className="menu-icon" />
            <Link
              to="/idopont-foglalasok"
              style={{ textDecoration: "none", color: "inherit" }}
              onClick={() => console.log("Kattintás az Időpont foglalásokra!")}
            >
              Időpont foglalások
            </Link>
          </li>

          <br />
          <li style={{ fontWeight: "700", fontSize: "16px" }}>
            <img src={profileBlank} alt="icon" className="menu-icon" />
            <Link to="/premium" style={{ textDecoration: "none", color: "inherit" }}>
            Premium előfizetés
            </Link> 
          </li>
        </ul>
      </aside>
      <div className="big-container">
        <div className="premium-container">
          <h1>S.O.S.Premium </h1>
          <p>Itt látható az S.O.S. Premium csomagunk előnyei</p>
          <div className="plans-wrapper">
            
              <div className="plan-card">
                <h2>Ingyenes</h2>
                <h3>0 Ft <span>havonta</span></h3>
                
                <ul>
                  <li>5db poszt</li>
                  <li>elsőbbség a posztoknál❌</li>
                </ul>
                <button className="plan-button">Fejlesztés alatt...</button>
              </div>

            
              <div className="plan-card highlighted">
                <h2>S.O.S. Premium</h2>
                <h3>4000 Ft <span>havonta</span></h3>
                <ul>
                  <li>Korlátlan posztok</li>
                  <li>elsőbbség a posztoknál✅</li>
                </ul>
                <button className="plan-button">Fejlesztés alatt...</button>
              </div>

            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;