import React, { useState } from "react";
import "../Stilusok/Regisztracio.css";

const Regisztracio = () => {
  const [formData, setFormData] = useState({
    vezeteknev: "",
    keresztnev: "",
    felhasznalonev: "",
    email: "",
    telefonszam: "",
    telepules: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Regisztrációs adatok:", formData);
  };

  return (
    <div className="regisztracio-container">
      <h2>Regisztráció</h2>
      <form onSubmit={handleSubmit} className="regisztracio-form">
        <div className="form-group">
          <label htmlFor="vezeteknev">Vezetéknév:</label>
          <input
            type="text"
            id="vezeteknev"
            name="vezeteknev"
            value={formData.vezeteknev}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="keresztnev">Keresztnév:</label>
          <input
            type="text"
            id="keresztnev"
            name="keresztnev"
            value={formData.keresztnev}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="felhasznalonev">Felhasználónév:</label>
          <input
            type="text"
            id="felhasznalonev"
            name="felhasznalonev"
            value={formData.felhasznalonev}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email cím:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="telefonszam">Telefonszám:</label>
          <input
            type="tel"
            id="telefonszam"
            name="telefonszam"
            value={formData.telefonszam}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="telepules">Település:</label>
          <input
            type="text"
            id="telepules"
            name="telepules"
            value={formData.telepules}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Regisztrálok</button>
      </form>
    </div>
  );
};

export default Regisztracio;
