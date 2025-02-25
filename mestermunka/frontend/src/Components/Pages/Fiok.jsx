import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Stilusok/Fiok.css";
import profileBlank from "../../assets/profile-blank.png";

const Fiok = () => {
  const [userData, setUserData] = useState({ felhasznalonev: "", emailcim: "",vezeteknev:"",keresztnev:"" });
  const [editing, setEditing] = useState(false);
  const [newData, setNewData] = useState({ felhasznalonev: "", emailcim: "", vezeteknev:"",keresztnev:"" });

  // Felhasználói adatok betöltése
  useEffect(() => {
    axios
      .get("http://localhost:5020/profile", { withCredentials: true })
      .then((response) => {
        if (response.data.success) {
          console.log(response)
          setUserData(response.data.user);
          setNewData(response.data.user); // Az új adatok először a meglévő értékek lesznek
        }
      })
      .catch((error) => {
        console.error("Hiba a felhasználói adatok betöltésekor:", error);
      });
  }, []);

  // Inputok változásának kezelése
  const handleChange = (e) => {
    setNewData({ ...newData, [e.target.name]: e.target.value });
  };

  // Adatok frissítése az adatbázisban
  const handleSave = () => {
    axios
      .put("http://localhost:5020/update-profile", newData, { withCredentials: true })
      .then((response) => {
        if (response.data.success) {
          setUserData(newData);
          setEditing(false);
          console.log(userData)
          console.log(newData)
          alert("Adatok sikeresen frissítve!");
        }
      })
      .catch((error) => {
        console.error("Hiba a frissítés során:", error);
      });
  };

  return (
    <div className="account-settings">
      <aside className="sidebar">
        <ul>
          <li className="active">
            <img src={profileBlank} alt="icon" className="menu-icon" /> Fiók beállítások
          </li>
          <br />
          <li style={{ fontWeight: "700", fontSize: "16px" }}>
            <img src={profileBlank} alt="icon" className="menu-icon" /> Jelszó és biztonság
          </li>
          <br />
          <li style={{ fontWeight: "700", fontSize: "16px" }}>
            <img src={profileBlank} alt="icon" className="menu-icon" /> Fizetés kezelés
          </li>
          <br />
          <li style={{ fontWeight: "700", fontSize: "16px" }}>
            <img src={profileBlank} alt="icon" className="menu-icon" /> Fizetési előzmények
          </li>
          <br />
        </ul>
      </aside>
      <main className="content">
        <h1>Fiók beállítások</h1>
        <section className="account-info">
          <table>
            <tbody>
              <tr>
                <td>
                  <label>Felhasználónév</label>
                  <input
                    type="text"
                    name="felhasznalonev"
                    value={newData.felhasznalonev}
                    onChange={handleChange}
                    disabled={!editing} // Alapból le van tiltva, csak szerkesztéskor engedélyezett
                  />
                </td>
                <td>
                  <label>Email-cím</label>
                  <input
                    type="text"
                    name="emailcim"
                    value={newData.emailcim}
                    onChange={handleChange}
                    disabled={!editing} // Alapból le van tiltva, csak szerkesztéskor engedélyezett
                  />
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  {!editing ? (
                    <button onClick={() => setEditing(true)}>Szerkesztés</button>
                  ) : (
                    <button onClick={handleSave}>Mentés</button>
                  )}
                </td>
              </tr>
              
              <tr>
                
              </tr>
              <tr>
                <td>
                  <label>Vezetéknév</label>
                  <input
                    type="text"
                    name="vezeteknev"
                    value={newData.vezeteknev}
                    onChange={handleChange}
                    disabled={!editing} // Alapból le van tiltva, csak szerkesztéskor engedélyezett
                  />
                </td>
                <td>
                  <label>Keresztnév</label>
                  <input
                    type="text"
                    name="keresztnev"
                    value={newData.keresztnev}
                    onChange={handleChange}
                    disabled={!editing} // Alapból le van tiltva, csak szerkesztéskor engedélyezett
                  />
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  {!editing ? (
                    <button onClick={() => setEditing(true)}>Szerkesztés</button>
                  ) : (
                    <button onClick={handleSave}>Mentés</button>
                  )}
                </td>
              </tr>
              
              <tr>
                
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default Fiok;
