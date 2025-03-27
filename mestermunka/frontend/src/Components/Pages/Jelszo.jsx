import React, { useState } from "react";
import axios from "axios";
import "../Stilusok/Fiok.css";
import profileBlank from "../../assets/profile-blank.png";
import { Link } from "react-router-dom";

const Jelszo = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Az új jelszavak nem egyeznek!");
      return;
    }
  
    axios
      .get("http://localhost:5020/user", { withCredentials: true })  // Lekérjük a bejelentkezett felhasználót
      .then((response) => {
        const { userID } = response.data.user;  // UserID a válaszból
  
        // Jelszó frissítése
        axios
          .put(
            "http://localhost:5020/update-password",
            {
              userID,
              oldPassword: passwordData.currentPassword,  // Régi jelszó hozzáadása
              newPassword: passwordData.newPassword,
            },
            { withCredentials: true }
          )
          .then((response) => {
            if (response.data.success) {
              alert("Jelszó sikeresen frissítve!");
              setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
              alert("Hiba történt a jelszó módosításakor.");
            }
          })
          .catch((error) => {
            console.error("Hiba a jelszó frissítésekor:", error);
            alert("Hiba történt a jelszó módosítása során.");
          });
      })
      .catch((error) => {
        console.error("Nincs bejelentkezve!", error);
        alert("Nincs bejelentkezve!");  // Ha nem található bejelentkezett felhasználó
      });
  };
  
  
  

  return (
    <div className="account-settings">
      <aside className="sidebar">
        <ul>
          <li className="active">
            <img src={profileBlank} alt="icon" className="menu-icon" /> 
            <Link to="/fiok" style={{ textDecoration: "none", color: "inherit" }}>
              Fiók beállitások
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
      <main className="content">
        <h1>Jelszó módosítása</h1>
        <section className="account-info">
          <table>
            <tbody>
              <tr>
                <td>
                  <label>Jelenlegi jelszó</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <label>Új jelszó</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <label>Új jelszó megerősítése</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </td>
              </tr>
              <tr>
                <td>
                  <button onClick={handleSavePassword}>Jelszó módosítása</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default Jelszo;