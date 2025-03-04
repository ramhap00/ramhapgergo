import React, { useState } from "react";
import "../Stilusok/Posztotcsinalok.css";

const Posztotcsinalok = ({ onPostCreated }) => {
  const [formData, setFormData] = useState({
    vezeteknev: "",
    keresztnev: "",
    telepules: "",
    telefonszam: "",
    kategoria: "",
    datum: "",
    leiras: "",
    fotok: null,
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, fotok: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    Object.keys(formData).forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = "Kötelező mező!";
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const userID = localStorage.getItem("userID");
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (userID) {
        data.append("userID", userID); // Hozzáadjuk az azonosítót
      }

      try {
        const response = await fetch("http://localhost:5020/api/poszt", {
          method: "POST",
          body: data,
          credentials: "include", // Küldje el a sütiket is
        });

        const result = await response.json();

        if (result.success) {
          alert("Poszt sikeresen létrehozva!");

          // Értesítjük a szülő komponenst, hogy új posztot hoztunk létre
          onPostCreated(result.post); // `onPostCreated` hívás

          setFormData({
            vezeteknev: "",
            keresztnev: "",
            telepules: "",
            telefonszam: "",
            kategoria: "",
            datum: "",
            leiras: "",
            fotok: null,
          });
          setPreview(null);
        } else {
          alert("Hiba történt: " + result.message);
        }
      } catch (error) {
        console.error("Hiba a poszt létrehozásakor:", error);
        alert("Hiba történt a poszt létrehozásakor!");
      }
    }
  };

  return (
    <div className="post-container">
      <h2>Poszt létrehozása</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="vezeteknev">Vezetéknév:</label>
          <input
            type="text"
            id="vezeteknev"
            name="vezeteknev"
            value={formData.vezeteknev}
            onChange={handleChange}
            placeholder="Vezetéknév"
          />
          {errors.vezeteknev && <span>{errors.vezeteknev}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="keresztnev">Keresztnév:</label>
          <input
            type="text"
            id="keresztnev"
            name="keresztnev"
            value={formData.keresztnev}
            onChange={handleChange}
            placeholder="Keresztnév"
          />
          {errors.keresztnev && <span>{errors.keresztnev}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="telepules">Település:</label>
          <input
            type="text"
            id="telepules"
            name="telepules"
            value={formData.telepules}
            onChange={handleChange}
            placeholder="Település"
          />
          {errors.telepules && <span>{errors.telepules}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="telefonszam">Telefonszám:</label>
          <input
            type="text"
            id="telefonszam"
            name="telefonszam"
            value={formData.telefonszam}
            onChange={handleChange}
            placeholder="Telefonszám"
          />
          {errors.telefonszam && <span>{errors.telefonszam}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="kategoria">Kategória:</label>
          <select
            id="kategoria"
            name="kategoria"
            value={formData.kategoria}
            onChange={handleChange}
          >
            <option value="">Válassz kategóriát</option>
            <option value="Festés">Festés</option>
            <option value="Kertészet">Kertészet</option>
            <option value="Szakács">Szakács</option>
            <option value="Programozó">Programozó</option>
          </select>
          {errors.kategoria && <span>{errors.kategoria}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="datum">Dátum:</label>
          <input
            type="date"
            id="datum"
            name="datum"
            value={formData.datum}
            onChange={handleChange}
          />
          {errors.datum && <span>{errors.datum}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="leiras">Leírás:</label>
          <textarea
            id="leiras"
            name="leiras"
            value={formData.leiras}
            onChange={handleChange}
            placeholder="Írd le a posztodat"
          ></textarea>
          {errors.leiras && <span>{errors.leiras}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="fotok">Fotók:</label>
          <input
            type="file"
            id="fotok"
            name="fotok"
            accept="image/*"
            onChange={handleFileChange}
          />
          {preview && <img src={preview} alt="Preview" />}
        </div>
        <div className="form-group">
          <button type="submit">Poszt létrehozása</button>
        </div>
      </form>
    </div>
  );
};

export default Posztotcsinalok;
