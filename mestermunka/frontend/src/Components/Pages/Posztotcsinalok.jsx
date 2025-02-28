import React, { useState } from "react";
import "../Stilusok/Posztotcsinalok.css";
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
    try {
      const response = await fetch("http://localhost:5020/api/poszt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Poszt sikeresen létrehozva!");
        setFormData({ vezeteknev: "", keresztnev: "", telepules: "", telefonszam: "", kategoria: "", datum: "", leiras: "", fotok: null });
      } else {
        alert("Hiba történt: " + data.message);
      }
    } catch (error) {
      console.error("Hiba a poszt létrehozásakor:", error);
      alert("Hiba történt a poszt létrehozásakor!");
    }
  }
};

const Posztotcsinalok = () => {
  const [formData, setFormData] = useState({
    vezeteknev: "",
    keresztnev: "",
    telepules: "",
    telefonszam: "",
    kategoria:"",
    datum:"",
    leiras: "",
    fotok: null,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    // Kötelező mezők validálása
    Object.keys(formData).forEach((key) => {
      if (!formData[key]) {
        newErrors[key] = "Kötelező mező!";
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert("Poszt sikeresen létrehozva!");
    }
  };

  return (
    <div className="post-container">
      <h2>Poszt létrehozása</h2>
      <form onSubmit={handleSubmit}>
        {/* Vezetéknév és keresztnév */}
        <div className="row">
          <div className="input-group">
            <label>Vezetéknév: <span className="required">*</span></label>
            <input
              type="text"
              name="vezeteknev"
              value={formData.vezeteknev}
              onChange={handleChange}
              className={errors.vezeteknev ? "error" : ""}
            />
            {errors.vezeteknev && <span className="error-message">{errors.vezeteknev}</span>}
          </div>
          <div className="input-group">
            <label>Keresztnév: <span className="required">*</span></label>
            <input
              type="text"
              name="keresztnev"
              value={formData.keresztnev}
              onChange={handleChange}
              className={errors.keresztnev ? "error" : ""}
            />
            {errors.keresztnev && <span className="error-message">{errors.keresztnev}</span>}
          </div>
        </div>

        {/* Település és telefonszám */}
        <div className="row">
          <div className="input-group">
            <label>Település: <span className="required">*</span></label>
            <input
              type="text"
              name="telepules"
              value={formData.telepules}
              onChange={handleChange}
              className={errors.telepules ? "error" : ""}
            />
            {errors.telepules && <span className="error-message">{errors.telepules}</span>}
          </div>
          <div className="input-group">
            <label>Telefonszám: <span className="required">*</span></label>
            <input
              type="text"
              name="telefonszam"
              value={formData.telefonszam}
              onChange={handleChange}
              className={errors.telefonszam ? "error" : ""}
            />
            {errors.telefonszam && <span className="error-message">{errors.telefonszam}</span>}
          </div>
        </div>
        <div className="row">
          <div className="input-group">
            <label>Kategoria: <span className="required">*</span></label>
            <input
              type="text"
              name="kategoria"
              value={formData.kategoria}
              onChange={handleChange}
              className={errors.kategoria ? "error" : ""}
            />
            {errors.kategoria && <span className="error-message">{errors.kategoria}</span>}
          </div>
          <div className="input-group">
            <label>Dátum: <span className="required">*</span></label>
            <input
              type="date"
              name="datum"
              value={formData.datum}
              onChange={handleChange}
              className={errors.datum ? "error" : ""}
            />
            {errors.datum && <span className="error-message">{errors.datum}</span>}
          </div>
        </div>

        {/* Leírás */}
        <div className="input-group">
          <label>Leírás: <span className="required">*</span></label>
          <textarea
            name="leiras"
            value={formData.leiras}
            onChange={handleChange}
            rows="4"
            className={errors.leiras ? "error" : ""}
          ></textarea>
          {errors.leiras && <span className="error-message">{errors.leiras}</span>}
        </div>

        {/* Fotók */}
        <div className="input-group">
          <label>Fotók: <span className="required">*</span></label>
          <div className={`photo-upload-placeholder ${errors.fotok ? "error" : ""}`}>
            Ide kerülnek a fotók
          </div>
          {errors.fotok && <span className="error-message">{errors.fotok}</span>}
        </div>

        {/* Beküldő gomb */}
        <button type="submit">Poszt létrehozása</button>
      </form>
    </div>
  );
};

export default Posztotcsinalok;
