import React, { useState, useEffect } from "react";
import "../Stilusok/Fiok.css";
import profileBlank from "../../assets/profile-blank.png";

const Fiok = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5020/api/getUserData", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,  
      },
      credentials: "include", 
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`API hiba: ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        setUsername(data.username);
        setEmail(data.email);
        setFirstName(data.firstName);
        setLastName(data.lastName);
      })
      .catch((error) => {
        console.error("Hiba történt:", error);  
        alert("Hiba történt az adatok lekérése közben!");
      });
  }, []);

  const handleSave = () => {
    const updatedData = {
      username,
      email,
      firstName,
      lastName,
    };

    fetch("http://localhost:5020/api/updateUserData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(updatedData),
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            console.error("Error updating user data:", text);
            throw new Error(`HTTP hiba: ${response.status}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log("User data updated successfully:", data);
        alert("Adatok sikeresen mentve!");
        setIsEditing(false); 
      })
      .catch(error => {
        console.error("Error updating user data:", error);
        alert("Hiba történt az adatok mentése közben!");
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
          <li style={{ fontWeight: '700', fontSize: '16px' }}>
            <img src={profileBlank} alt="icon" className="menu-icon" /> Jelszó és biztonság
          </li>
          <br />
          <li style={{ fontWeight: '700', fontSize: '16px' }}>
            <img src={profileBlank} alt="icon" className="menu-icon" /> Fizetés kezelés
          </li>
          <br />
          <li style={{ fontWeight: '700', fontSize: '16px' }}>
            <img src={profileBlank} alt="icon" className="menu-icon" /> Fizetési előzmények
          </li>
          <br />
        </ul>
      </aside>
      <main className="content">
        <h1>Fiók beállítások</h1>
        <section className="account-info">
          <table>
            <thead>
              <tr>
                <th>Felhasználónév</th>
                <th>Email-cím</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!isEditing} 
                  />
                  <button onClick={() => {
                    if (isEditing) {
                      handleSave(); 
                    }
                    setIsEditing(!isEditing);
                  }}>
                    {isEditing ? "Mentés" : "Szerkesztés"}
                  </button>
                </td>
                <td>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing} 
                  />
                  <button onClick={() => {
                    if (isEditing) {
                      handleSave();
                    }
                    setIsEditing(!isEditing);
                  }}>
                    {isEditing ? "Mentés" : "Szerkesztés"}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <br />
          <table>
            <thead>
              <tr>
                <th>Vezetéknév</th>
                <th>Keresztnév</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={!isEditing} 
                  />
                  <button onClick={() => {
                    if (isEditing) {
                      handleSave(); 
                    }
                    setIsEditing(!isEditing);
                  }}>
                    {isEditing ? "Mentés" : "Szerkesztés"}
                  </button>
                </td>
                <td>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={!isEditing} 
                  />
                  <button onClick={() => {
                    if (isEditing) {
                      handleSave(); 
                    }
                    setIsEditing(!isEditing);
                  }}>
                    {isEditing ? "Mentés" : "Szerkesztés"}
                  </button>
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
