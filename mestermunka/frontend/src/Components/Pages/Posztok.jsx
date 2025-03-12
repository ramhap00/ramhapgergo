import React, { useState, useEffect } from "react";
import "../Stilusok/Posztok.css";

const Posztok = () => {
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

  // Posztok és felhasználói értékelések betöltése
  useEffect(() => {
    const fetchPostsAndRatings = async () => {
      try {
        // Posztok lekérése
        const postsResponse = await fetch("http://localhost:5020/api/posztok");
        if (!postsResponse.ok) throw new Error(`HTTP hiba! Státusz: ${postsResponse.status}`);
        const postsData = await postsResponse.json();
        if (postsData.success) {
          setPosts(postsData.posts);
          setFilteredPosts(postsData.posts);

          // Felhasználói értékelések lekérése minden poszthoz
          const token = getTokenFromCookie();
          if (token) {
            const ratingsData = {};
            await Promise.all(
              postsData.posts.map(async (post) => {
                const ratingResponse = await fetch(`http://localhost:5020/api/user-rating/${post.posztID}`, {
                  headers: {
                    "Authorization": `Bearer ${token}`,
                  },
                  credentials: "include",
                });
                const ratingData = await ratingResponse.json();
                if (ratingData.success && ratingData.rating > 0) {
                  ratingsData[post.posztID] = ratingData.rating;
                }
              })
            );
            setRatings(ratingsData);
          }
        }
      } catch (error) {
        console.error("Hiba a posztok vagy értékelések betöltésekor:", error.message);
      }
    };

    fetchPostsAndRatings();
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

    setFilteredPosts(filtered.length > 0 ? filtered : []);
    setErrorMessage(filtered.length === 0 ? "❌ Ilyen hirdetés nincs!" : "");
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

    // Ha már értékeltük, ne tegyünk semmit
    if (ratings[postId]) {
      return;
    }

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
      if (data.success) {
        setRatings((prev) => ({ ...prev, [postId]: rating }));
        // Frissítjük a posztok listáját az új átlaggal
        const updatedResponse = await fetch("http://localhost:5020/api/posztok");
        const updatedData = await updatedResponse.json();
        if (updatedData.success) {
          setPosts(updatedData.posts);
          setFilteredPosts(updatedData.posts);
        }
      } else {
        console.error("Hiba az értékelés mentésekor:", data.message);
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
          className={`star ${i <= (hoverRating || userRating) ? "filled" : ""}`}
          style={{
            color: i <= (hoverRating || userRating) ? "orange" : "gray",
            cursor: userRating ? "default" : "pointer", // Ha már értékelt, nem kattintható
          }}
          onMouseEnter={() => !userRating && setHoverRating(i)} // Csak ha nincs értékelés
          onMouseLeave={() => !userRating && setHoverRating(0)}
          onClick={() => !userRating && handleRating(postId, i)} // Csak ha nincs értékelés
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