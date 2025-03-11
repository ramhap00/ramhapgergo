import React, { useState } from "react";
import "../Stilusok/Posztotcsinalok.css";

const Posztotcsinalok = ({ onPostCreated }) => {
  const [formData, setFormData] = useState({
    vezeteknev: "",
    keresztnev: "",
    fejlec: "",
    telepules: "",
    telefonszam: "",
    kategoria: "",
    datum: "",
    leiras: "",
    fotok: null,
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);

  const categories = [
    "Festés", "Kertészet", "Szakács", "Programozó", "Falazás", "Vakolás",
    "Parkettázás", "Autószerelés", "Gázszerelés", "Klimaszerelés", "Tv-szerelő",
    "Tetőfedés", "Állatorvos", "Műköröm"
  ];

  const locations = [
    "Bács-Kiskun", "Baranya", "Békés", "Borsod-Abaúj-Zemplén", "Csongrád-Csanád",
    "Fejér", "Győr-Moson-Sopron", "Hajdú-Bihar", "Heves", "Jász-Nagykun-Szolnok",
    "Komárom-Esztergom", "Nógrád", "Pest", "Somogy", "Szabolcs-Szatmár-Bereg", "Tolna",
    "Vas", "Veszprém", "Zala"
  ];

  const validatePhoneNumber = (phoneNumber) => {
    // A telefonszámnak legalább 11 számjegy hosszúnak kell lennie, és csak számokat vagy "+" jelet tartalmazhat
    const phoneRegex = /^[0-9+]{11,}$/;
    return phoneRegex.test(phoneNumber);
  };

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

    // Ellenőrizzük, hogy minden mező ki van-e töltve
    Object.keys(formData).forEach((key) => {
      if (!formData[key] && key !== "fotok") {
        newErrors[key] = "Kötelező mező!";
      }
    });

    // Telefonszám validálása
    if (formData.telefonszam && !validatePhoneNumber(formData.telefonszam)) {
      newErrors.telefonszam = "Érvénytelen telefonszám!";
    }

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
            fejlec: "",
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
          <label htmlFor="vezeteknev">Vezetéknév:<span className="required">*</span></label>
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
          <label htmlFor="keresztnev">Keresztnév:<span className="required">*</span></label>
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
          <label htmlFor="fejlec">Fejléc:<span className="required">*</span></label>
          <input
            type="text"
            id="fejlec"
            name="fejlec"
            value={formData.fejlec}
            onChange={handleChange}
            placeholder="Fejléc"
          />
          {errors.fejlec && <span>{errors.fejlec}</span>}
        </div>
        <div className="form-group">
      <label htmlFor="telepules">Település:<span className="required">*</span></label>
      <select
    id="telepules"
    name="telepules"
    value={formData.telepules}
    onChange={handleChange}
    className={errors.telepules ? "error" : ""}
     >
        <option value="">Válassz települést</option>
       {locations.map((city, index) => (
      <option key={index} value={city}>{city}</option>
       ))}
     </select>
       {errors.telepules && <span className="error-message">{errors.telepules}</span>}
      </div>
        <div className="form-group">
          <label htmlFor="telefonszam">Telefonszám:<span className="required">*</span></label>
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
  <label htmlFor="kategoria">Kategória:<span className="required">*</span></label>
  <select
    id="kategoria"
    name="kategoria"
    value={formData.kategoria}
    onChange={handleChange}
    className={errors.kategoria ? "error" : ""}
  >
    <option value="">Válassz kategóriát</option>
    {categories.map((category, index) => (
      <option key={index} value={category}>{category}</option>
    ))}
  </select>
  {errors.kategoria && <span className="error-message">{errors.kategoria}</span>}
</div>
        <div className="form-group">
          <label htmlFor="datum">Dátum:<span className="required">*</span></label>
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
          <label htmlFor="leiras">Leírás:<span className="required">*</span></label>
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
          <label htmlFor="fotok">Fotók:<span className="required">*</span></label>
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
