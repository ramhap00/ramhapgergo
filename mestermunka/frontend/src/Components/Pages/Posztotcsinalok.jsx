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
    fotok: [],
  });

  const [errors, setErrors] = useState({});
  const [previews, setPreviews] = useState([]);

  const categories = [
    "Festés", "Kertészet", "Szakács", "Programozó", "Falazás", "Vakolás", "Burkolás", "Asztalosmunka",
    "Parkettázás", "Autószerelés", "Gázszerelés", "Klimaszerelés", "Tv-szerelő",
    "Tetőfedés", "Állatorvos", "Műköröm"
  ];

  const locations = [
    "Bács-Kiskun", "Baranya", "Békés", "Borsod-Abaúj-Zemplén", "Csongrád-Csanád",
    "Fejér", "Győr-Moson-Sopron", "Hajdú-Bihar", "Heves", "Jász-Nagykun-Szolnok",
    "Komárom-Esztergom", "Nógrád", "Pest", "Somogy", "Szabolcs-Szatmár-Bereg", "Tolna",
    "Vas", "Veszprém", "Zala"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert("Maximum 5 képet tölthetsz fel!");
      return;
    }
    if (files.length > 0) {
      setFormData({ ...formData, fotok: files });
      const previewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviews(previewUrls);
    }
  };

  const getToken = () => {
    const cookies = document.cookie.split("; ");
    const authCookie = cookies.find((row) => row.startsWith("authToken="));
    return authCookie ? authCookie.split("=")[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key === "fotok") {
        if (formData.fotok.length === 0) {
          newErrors[key] = "Legalább egy képet fel kell tölteni!";
        }
      } else if (!formData[key]) {
        newErrors[key] = "Kötelező mező!";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const token = getToken();
    if (!token) {
      alert("⚠️ Be kell jelentkezni a poszt létrehozásához!");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "fotok") {
        formData.fotok.forEach((file) => {
          data.append("fotok", file);
        });
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await fetch("http://localhost:5020/api/poszt", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
        body: data,
      });

      const result = await response.json();
      if (result.success) {
        alert("🎉 Poszt sikeresen létrehozva!");
        onPostCreated(result.post);

        setFormData({
          vezeteknev: "",
          keresztnev: "",
          fejlec: "",
          telepules: "",
          telefonszam: "",
          kategoria: "",
          datum: "",
          leiras: "",
          fotok: [],
        });
        setPreviews([]);
        setErrors({});
      } else {
        alert("❌ Hiba történt: " + result.message);
      }
    } catch (error) {
      console.error("Hiba a poszt létrehozásakor:", error);
      alert("❌ Hiba történt a poszt létrehozásakor!");
    }
  };

  return (
    <div className="post-container">
      <h2>Poszt létrehozása</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="vezeteknev">
            Vezetéknév:<span className="required">*</span>
          </label>
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
          <label htmlFor="keresztnev">
            Keresztnév:<span className="required">*</span>
          </label>
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
          <label htmlFor="fejlec">
            Poszt címe:<span className="required">*</span>
          </label>
          <input
            type="text"
            id="fejlec"
            name="fejlec"
            value={formData.fejlec}
            onChange={handleChange}
            placeholder="Cím"
          />
          {errors.fejlec && <span>{errors.fejlec}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="telepules">
            Megye:<span className="required">*</span>
          </label>
          <select
            id="telepules"
            name="telepules"
            value={formData.telepules}
            onChange={handleChange}
            className={errors.telepules ? "error" : ""}
          >
            <option value="">Válassz megyét</option>
            {locations.map((city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.telepules && (
            <span className="error-message">{errors.telepules}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="telefonszam">
            Telefonszám:<span className="required">*</span>
          </label>
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
          <label htmlFor="kategoria">
            Kategória:<span className="required">*</span>
          </label>
          <select
            id="kategoria"
            name="kategoria"
            value={formData.kategoria}
            onChange={handleChange}
            className={errors.kategoria ? "error" : ""}
          >
            <option value="">Válassz kategóriát</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.kategoria && (
            <span className="error-message">{errors.kategoria}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="datum">
            Dátum:<span className="required">*</span>
          </label>
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
          <label htmlFor="leiras">
            Leírás:<span className="required">*</span>
          </label>
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
          <label htmlFor="fotok">
            Fotók:<span className="required">*</span>
          </label>
          <input
            type="file"
            id="fotok"
            name="fotok"
            accept="image/*"
            onChange={handleFileChange}
            multiple
          />
          {previews.length > 0 && (
            <div className="preview-container">
              {previews.map((preview, index) => (
                <img key={index} src={preview} alt={`Preview ${index}`} style={{ width: "100px", margin: "5px" }} />
              ))}
            </div>
          )}
          {errors.fotok && <span>{errors.fotok}</span>}
        </div>
        <div className="form-group">
          <button type="submit">Poszt létrehozása</button>
        </div>
      </form>
    </div>
  );
};

export default Posztotcsinalok;