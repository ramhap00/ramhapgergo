import React, { useState, useEffect } from "react";
import "../Stilusok/Posztok.css";

const Posztok = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [location, setLocation] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sliderValue, setSliderValue] = useState([0, 1000000]); // Csúszka alapértékei
  const [posts, setPosts] = useState([]);

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

  // Posztok betöltése
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5020/api/posztok");
        const data = await response.json();
        if (data.success) {
          setPosts(data.posts);
        } else {
          console.error("Hiba történt a posztok betöltésekor");
        }
      } catch (error) {
        console.error("Hiba a posztok betöltésekor:", error);
      }
    };

    fetchPosts();
  }, []);

  const handleCheckboxChange = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const handleSearch = () => {
    if (!categories.includes(searchTerm)) {
      setErrorMessage("❌ Ilyen hirdetés nincs!");
    } else {
      setErrorMessage("");
    }
  };

  const handleSliderChange = (e, index) => {
    const newValue = [...sliderValue];
    newValue[index] = e.target.value;
    setSliderValue(newValue);
    setPriceRange(newValue);
  };

  // Callback funkció, hogy frissítse a posztokat, amikor új posztot hoznak létre
  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [...prevPosts, newPost]);
  };

  return (
    <div className="posztok-container">
      <div className="posztok-layout">
        <div className="posztok-filter">
          <h2>Szűrők</h2>
          
          {/* 🔍 Kereső mező */}
          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Keresés..."
            />
            <button className="button1" onClick={handleSearch}>🔎</button>
          </div>

          {/* 🚨 Hibaüzenet */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {/* Kategória választó */}
          <label>Kategória:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Válassz kategóriát</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Ár választó */}
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
            <input
              type="range"
              min="0"
              max="1000000"
              value={priceRange[0]}
              onChange={(e) => handleSliderChange(e, 0)}
              className="price-slider"
            />
            <input
              type="range"
              min="0"
              max="1000000"
              value={priceRange[1]}
              onChange={(e) => handleSliderChange(e, 1)}
              className="price-slider"
            />
          </div>

          {/* Település választó */}
          <label>Település:</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">Válassz települést</option>
            {locations.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          {/* Állapot választó */}
          <label>Állapot:</label>
          <div className="status-container">
            {options.map((option) => (
              <div className="status-item" key={option}>
                <span>{option}</span>
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Jobb oldali posztok */}
        <div className="posztok-content">
          <div className="posztok-list">
            <h2>Posztok</h2>
            {posts.length === 0 ? (
              <p>Nincs még poszt!</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="post-item">
                  <h3>{post.vezeteknev} {post.keresztnev}</h3>
                  <p>Kategória: {post.kategoria}</p>
                  <p>Település: {post.telepules}</p>
                  <p>Leirás:</p>
                  <p>{post.leiras}</p>
                  <img
                  src={`http://localhost:5020/uploads/${post.fotok}`}
                  alt="Post Image"
                  style={{ width: '150px', height: 'auto', objectFit: 'cover', borderRadius: '8px' }}
                  />

                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Posztok;
