import React, { useState, useEffect } from "react";
import "../Stilusok/Sajatposztok.css";
import { Link } from "react-router-dom";

const Sajatposztok = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState(["", ""]);
  const [location, setLocation] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sliderValue, setSliderValue] = useState([0, 0]);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  // Felhasználó adatainak lekérése a localStorage-ból
  const user = JSON.parse(localStorage.getItem("user")); // JSON.parse() szükséges, ha objektumot tároltál
  const userId = user ? user.userID : null;  // Ha létezik felhasználó, akkor kinyerjük az userID-t

  const categories = [
    "Festés", "Kertészet", "Szakács", "Programozó", "Falazás", "Vakolás",
    "Parkettázás", "Autószerelés", "Gázszerelés", "Klimaszerelés", "Tv-szerelő",
    "Tetőfedés", "Állatorvos", "Műköröm"
  ];

  const locations = [
    "Bács-Kiskun", "Baranya", "Békés", "Borsod-Abaúj-Zemplén", "Csongrád-Csanád",
    "Fejér", "Győr-Moson-Sopron", "Hajdú-Bihar", "Heves", "Jász-Nagykun-Szolnok",
    "Komárom-Esztergom", "Nógrád", "Pest", "Somogy", "Szabolcs-Szatmár-Bereg", "Tolna",
    "Vas", "Veszprém", "Zala", "Budapest"
  ];

  const options = ["Elérhető", "Nem elérhető"];

  // A posztok betöltése az API-ból
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5020/api/posztok");
        const data = await response.json();
        if (data.success) {
          setPosts(data.posts); // Az összes posztot betöltjük
        } else {
          console.error("Hiba történt a posztok betöltésekor");
        }
      } catch (error) {
        console.error("Hiba a posztok betöltésekor:", error);
      }
    };

    fetchPosts();
  }, []);

  // Szűrés a bejelentkezett felhasználóhoz tartozó posztokra, ha már betöltődtek
  useEffect(() => {
    if (userId && posts.length > 0) {
      const userPosts = posts.filter(post => post.userId === userId); // Azokat a posztokat szűrjük, amik a bejelentkezett felhasználóhoz tartoznak
      setFilteredPosts(userPosts);  // Beállítjuk a szűrt posztokat, amint a posztok betöltődtek
    }
  }, [posts, userId]);

  const handleCheckboxChange = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const handleSearch = () => {
    let filtered = posts.filter(post =>
      (post.vezeteknev.toLowerCase().includes(searchTerm.toLowerCase()) || 
      post.keresztnev.toLowerCase().includes(searchTerm.toLowerCase()) || 
      post.leiras.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Ha van választott kategória, szűrjük a kategóriát is
    if (selectedCategory) {
      filtered = filtered.filter(post => post.kategoria === selectedCategory);
    }

    // Ha van választott település, szűrjük azt is
    if (location) {
      filtered = filtered.filter(post => post.telepules === location);
    }

    // Állapot szűrés
    if (selectedOptions.length > 0) {
      filtered = filtered.filter(post => selectedOptions.includes(post.allapot));
    }

    if (filtered.length === 0) {
      setErrorMessage("❌ Ilyen hirdetés nincs!");
    } else {
      setErrorMessage("");
    }

    setFilteredPosts(filtered); // Beállítjuk a szűrt posztokat
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

          <br />
          <br />
          <br />
          <Link to="/posztotcsinalok"><button>Új poszt</button></Link>
          </div>
          <div className="posztok-content">
            <div className="posztok-list">
          {/* Posztok listázása */}
            {filteredPosts.length === 0 ? (
              <p>Nincsenek saját posztjaid!</p>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className="post-item">

                  <div className="post-item-content">
                  <h3>{post.vezeteknev} {post.keresztnev}</h3>
                  <h4>{post.fejlec}</h4>
                  <p><span className="category-label">Kategória:</span> {post.kategoria}</p>
                  <p><span className="location-label">Település:</span> {post.telepules}</p>
                  <p><span className="phone-label">Telefonszám:</span> {post.telefonszam}</p>
                  <p>{post.leiras}</p>
                  <img
                    src={`http://localhost:5020/uploads/${post.fotok}`} alt="Post Image"/>
                    <p className="creation-date">Létrehozás dátuma: {new Date(post.datum).toLocaleDateString("hu-HU")}</p>
                  </div>
                  
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Sajatposztok;
