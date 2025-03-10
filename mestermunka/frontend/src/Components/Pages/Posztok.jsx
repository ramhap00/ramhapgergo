import React, { useState, useEffect } from "react";
import "../Stilusok/Posztok.css";

const Posztok = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [location, setLocation] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  
  // Modális poszt
  const [selectedPost, setSelectedPost] = useState(null); // Kiválasztott poszt
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal állapot

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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5020/api/posztok");
        const data = await response.json();
        if (data.success) {
          setPosts(data.posts);
          setFilteredPosts(data.posts); // Az első betöltéskor minden posztot mutassunk
        } else {
          console.error("Hiba történt a posztok betöltésekor");
        }
      } catch (error) {
        console.error("Hiba a posztok betöltésekor:", error);
      }
    };

    fetchPosts();
  }, []);

  const handleSearch = () => {
    let filtered = posts;

    if (selectedCategory) {
      filtered = filtered.filter(post => post.kategoria === selectedCategory);
    }

    if (location) {
      filtered = filtered.filter(post => post.telepules === location);
    }

    if (selectedOptions.length > 0) {
      filtered = filtered.filter(post => selectedOptions.includes(post.allapot));
    }

    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.kategoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.fejlec.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.vezeteknev.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.keresztnev.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.leiras.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filtered.length === 0) {
      setErrorMessage("❌ Ilyen hirdetés nincs!");
    } else {
      setErrorMessage("");
    }

    setFilteredPosts(filtered);
  };

  const handleCheckboxChange = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  // Modális ablak kezelése
  const handlePostClick = (post) => {
    setSelectedPost(post); // Kiválasztott poszt
    setIsModalOpen(true); // Modal megnyitása
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Modal bezárása
    setSelectedPost(null); // Kiválasztott poszt törlése
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
            {filteredPosts.length === 0 ? (
              <p>Nincs ilyen poszt!</p>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="post-item"
                  onClick={() => handlePostClick(post)} // Kattintás esemény
                >
                  <h3>{post.vezeteknev} {post.keresztnev}</h3>
                  <h4>Leírás: {post.fejlec}</h4>
                  <p>Kategória: {post.kategoria}</p>
                  <p>Település: {post.telepules}</p>
                  <p>{post.leiras}</p>
                  <img
                    src={`http://localhost:5020/uploads/${post.fotok}`}
                    alt="Post Image"
                    style={{ width: '150px', height: 'auto', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <p>Létrehozás dátuma: {new Date(post.datum).toLocaleDateString("hu-HU")}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedPost && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedPost.fejlec}</h2>
            <h3>{selectedPost.vezeteknev} {selectedPost.keresztnev}</h3>
            <p>{selectedPost.leiras}</p>
            <p><strong>Kategória:</strong> {selectedPost.kategoria}</p>
            <p><strong>Település:</strong> {selectedPost.telepules}</p>
            <p><strong>Dátum:</strong> {new Date(selectedPost.datum).toLocaleDateString("hu-HU")}</p>
            <img
              src={`http://localhost:5020/uploads/${selectedPost.fotok}`}
              alt="Post Image"
              style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '8px' }}
            />
            <button onClick={handleCloseModal}>Bezárás</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posztok;
