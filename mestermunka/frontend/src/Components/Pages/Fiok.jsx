import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "../Stilusok/Fiok.css";
import profileBlank from "../../assets/profile-blank.png";
import { Link } from "react-router-dom";
import { UserContext } from "../../UserContext";

const Fiok = () => {
  const { user, setUser } = useContext(UserContext);
  const [userData, setUserData] = useState({
    felhasznalonev: "",
    emailcim: "",
    vezeteknev: "",
    keresztnev: "",
    profilkep: "",
    munkasreg: 0,
  });
  const [editing, setEditing] = useState(false);
  const [newData, setNewData] = useState({
    felhasznalonev: "",
    emailcim: "",
    vezeteknev: "",
    keresztnev: "",
    profilkep: "",
    munkasreg: 0,
  });
  const [newProfileImage, setNewProfileImage] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5020/profile", { withCredentials: true })
      .then((response) => {
        if (response.data.success) {
          const updatedUserData = response.data.user;
          console.log("Betöltött user adatok:", updatedUserData);
          setUserData(updatedUserData);
          setNewData(updatedUserData);
          if (setUser) {
            setUser((prev) => ({
              ...prev,
              ...updatedUserData,
            }));
          }
        }
      })
      .catch((error) => {
        console.error("Hiba a felhasználói adatok betöltésekor:", error);
      });
  }, [setUser]);

  const handleChange = (e) => {
    setNewData({ ...newData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setNewProfileImage(e.target.files[0]);
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append("felhasznalonev", newData.felhasznalonev);
    formData.append("emailcim", newData.emailcim);
    formData.append("vezeteknev", newData.vezeteknev);
    formData.append("keresztnev", newData.keresztnev);
    if (newProfileImage) {
      formData.append("profilkep", newProfileImage);
    }

    axios
      .put("http://localhost:5020/update-profile", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        console.log("Válasz a szerverről:", response.data);
        if (response.data.success) {
          const updatedProfilkep = response.data.profilkep;
          setUserData((prev) => ({ ...prev, profilkep: updatedProfilkep }));
          setNewData((prev) => ({ ...prev, profilkep: updatedProfilkep }));
          if (setUser) {
            setUser((prev) => ({
              ...prev,
              felhasznalonev: newData.felhasznalonev,
              emailcim: newData.emailcim,
              vezeteknev: newData.vezeteknev,
              keresztnev: newData.keresztnev,
              profilkep: updatedProfilkep,
              munkasreg: userData.munkasreg,
            }));
          }
          setEditing(false);
          setNewProfileImage(null);
          alert("Adatok sikeresen frissítve!");
        }
      })
      .catch((error) => {
        console.error("Hiba a frissítés során:", error);
      });
  };

  const profileImage = userData.profilkep
    ? `http://localhost:5020/uploads/${userData.profilkep}?t=${Date.now()}`
    : profileBlank;

  return (
    <div className="account-settings">
      <aside className="sidebar">
        <ul>
          <li className="active">
            <img src={profileBlank} alt="icon" className="menu-icon" /> Fiók
            beállítások
          </li>
          <br />
          <li style={{ fontWeight: "700", fontSize: "16px" }}>
            <img src={profileBlank} alt="icon" className="menu-icon" />
            <Link
              to="/jelszo"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Jelszó és biztonság
            </Link>
          </li>
          <br />
          <li style={{ fontWeight: "700", fontSize: "16px" }}>
            <img src={profileBlank} alt="icon" className="menu-icon" />
            <Link
              to="/idopont-foglalasok"
              style={{ textDecoration: "none", color: "inherit" }}
              onClick={() => console.log("Kattintás az Időpont foglalásokra!")} // Debug log
            >
              Időpont foglalások
            </Link>
          </li>
          <br />
          <li style={{ fontWeight: "700", fontSize: "16px" }}>
            <img src={profileBlank} alt="icon" className="menu-icon" /> Fizetési
            előzmények
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
                <td colSpan="2">
                  <label>Profilkép</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={!editing}
                  />
                  {newProfileImage && (
                    <img
                      src={URL.createObjectURL(newProfileImage)}
                      alt="Preview"
                      className="rounded-image"
                    />
                  )}
                  {!newProfileImage && userData.profilkep && (
                    <img
                      src={profileImage}
                      alt="Current Profile"
                      className="rounded-image"
                    />
                  )}
                </td>
              </tr>
              <tr>
                <td>
                  <label>Felhasználónév</label>
                  <input
                    type="text"
                    name="felhasznalonev"
                    value={newData.felhasznalonev}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </td>
                <td>
                  <label>Email-cím</label>
                  <input
                    type="text"
                    name="emailcim"
                    value={newData.emailcim}
                    onChange={handleChange}
                    disabled={!editing}
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
                <td>
                  <label>Vezetéknév</label>
                  <input
                    type="text"
                    name="vezeteknev"
                    value={newData.vezeteknev}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </td>
                <td>
                  <label>Keresztnév</label>
                  <input
                    type="text"
                    name="keresztnev"
                    value={newData.keresztnev}
                    onChange={handleChange}
                    disabled={!editing}
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
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default Fiok;