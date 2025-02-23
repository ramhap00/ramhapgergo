import React, { useState } from "react";
import "../Stilusok/Posztok.css";
 
const Posztok = () => {
    const [selectedCategory, setSelectedCategory] = useState("");
    const [priceRange, setPriceRange] = useState(["", ""]);
    const [location, setLocation] = useState("");
    const [selectedOptions, setSelectedOptions] = useState([]);
 
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
    const options = ["Elérhető", "Nem elérhető"];
 
    const handleCheckboxChange = (option) => {
      setSelectedOptions((prev) =>
        prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
      );
    };
 
    return (
      <div className="filter-container">
        <h2>Szűrők</h2>
       
        {}
        <label>Kategória:</label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">Válassz kategóriát</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
       
        {}
        <label>Ár:</label>
        <div className="price-inputs">
          <input
            type="number"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([e.target.value, priceRange[1]])}
            placeholder="Min"
          />
          <span>Ft</span>
          <input
            type="number"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], e.target.value])}
            placeholder="Max"
          />
          <span>Ft</span>
        </div>
        <div className="price-slider-container">
          <div className="slider-track"></div>
          <input
            type="range"
            min="0"
            max="1000000"
            value={priceRange[0] || 0}
            onChange={(e) => setPriceRange([e.target.value, priceRange[1]])}
            className="price-slider"
          />
          <input
            type="range"
            min="0"
            max="1000000"
            value={priceRange[1] || 1000000}
            onChange={(e) => setPriceRange([priceRange[0], e.target.value])}
            className="price-slider"
          />
        </div>
       
        {}
        <label>Település:</label>
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">Válassz települést</option>
          {locations.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
       
        {}
        <label>Állapot:</label>
        {options.map((option) => (
          <div key={option}>
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => handleCheckboxChange(option)}
            />
            <span>{option}</span> {}
          </div>
        ))}
      </div>
    );
  };
 
  export default Posztok;