import React, { useState, useEffect } from "react";
import "../Stilusok/Posztok.css";

const Posztok = () => {
  // Token kinyerése a sütiből
  const getTokenFromCookie = () => {
    const cookies = document.cookie.split("; ");
    const authCookie = cookies.find((cookie) => cookie.startsWith("authToken="));
    return authCookie ? authCookie.split("=")[1] : null;
  };
  const [selectedCategory, setSelectedCategory] = useState("");
  const [location, setLocation] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ratings, setRatings] = useState({}); // Felhasználó saját értékelései
  const [hoverRating, setHoverRating] = useState(0); // Egérfeletti csillagok

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
        if (!response.ok) {
          throw new Error(`HTTP hiba! Státusz: ${response.status}`);
        }
        const data = await response.json();
        console.log("Backend válasz:", data);
        if (data.success) {
          setPosts(data.posts);
          setFilteredPosts(data.posts);
        } else {
          console.error("Hiba történt a posztok betöltésekor:", data.message);
        }
      } catch (error) {
        console.error("Hiba a posztok betöltésekor:", error.message);
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

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleRating = async (postId, rating) => {
    const token = getTokenFromCookie();
  
    if (!token) {
      alert("Kérlek, jelentkezz be az értékeléshez!");
      return;
    }
  
    setRatings((prev) => ({
      ...prev,
      [postId]: rating,
    }));
  
    try {
      const response = await fetch("http://localhost:5020/api/ertekelesek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ postId, rating }),
      });
  
      const data = await response.json();
      console.log("API válasz:", data);
  
      if (data.success) {
        console.log("Értékelés mentve");
        // Frissítjük a posztok listáját
        const updatedResponse = await fetch("http://localhost:5020/api/posztok");
        const updatedData = await updatedResponse.json();
        if (updatedData.success) {
          setPosts(updatedData.posts);
          setFilteredPosts(updatedData.posts);
        }
      } else {
        console.error("Hiba történt az értékelés mentésekor:", data.message);
      }
    } catch (error) {
      console.error("Hiba az értékelés küldésekor:", error.message);
    }
  };
  
  

  const renderStars = (post) => {
    
    const postId = post.posztID;
    const userRating = ratings[postId] || 0;
    const averageRating = post.averageRating || 0;
    const ratingCount = post.ratingCount || 0;
    let stars = [];
  
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= userRating ? "filled" : ""}`}
          style={{ color: i <= userRating ? "orange" : "gray", cursor: ratings[postId] ? "default" : "pointer" }}
          onMouseEnter={() => !ratings[postId] && setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => !ratings[postId] && handleRating(postId, i)}
        >
          ★
        </span>
      );
    }
  
    return (
      <div>
        <div>{stars}</div>
        <p>Átlag: {averageRating.toFixed(1)} ({ratingCount} értékelés)</p>
      </div>
    );
  };

  return (
    <div className="posztok-container">
      <div className="posztok-layout">
        <div className="posztok-filter">
          <h2>Szűrők</h2>
          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Keresés..."
            />
            <button className="button1" onClick={handleSearch}>🔎</button>
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <label>Kategória:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Válassz kategóriát</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <label>Település:</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">Válassz települést</option>
            {locations.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
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
        <div className="posztok-content">
          <div className="posztok-list">
            {filteredPosts.length === 0 ? (
              <p>Nincs ilyen poszt!</p>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.posztID} className="post-item" onClick={() => handlePostClick(post)}>
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
                  <div className="stars">
                    {renderStars(post)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
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
            <div className="stars">
              {renderStars(selectedPost)}
            </div>
            <button onClick={handleCloseModal}>Bezárás</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posztok;
