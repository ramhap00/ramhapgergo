import React, { useState, useEffect } from "react";
import "../Stilusok/Sajatposztok.css";
import { Link } from "react-router-dom";

const Sajatposztok = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [location, setLocation] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  const userString = localStorage.getItem("user");
  console.log("🔍 Sajatposztok - localStorage.user:", userString);
  const user = userString ? JSON.parse(userString) : null;
  const userId = user && user.userID ? Number(user.userID) : null;
  console.log("🔍 Sajatposztok - parsed user:", user);
  console.log("🔍 Sajatposztok - userId:", userId);

  const categories = [
    "Festés", "Kertészet", "Szakács", "Programozó", "Falazás", "Vakolás", "Burkolás", "Asztalosmunka",
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

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:5020/api/posztok", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        console.log("🔍 Összes poszt:", data.posts);
        const userPosts = data.posts.filter((post) => {
          const isMatch = Number(post.userID) === userId;
          console.log(`Poszt userID: ${post.userID}, Összehasonlítás: ${isMatch}`);
          return isMatch;
        });
        console.log("🔍 Saját posztok:", userPosts);
        setPosts(data.posts);
        setFilteredPosts(userPosts);
        if (userPosts.length === 0) {
          setErrorMessage("Nincsenek saját posztjaid!");
        }
      } else {
        setErrorMessage("Hiba történt a posztok betöltésekor!");
      }
    } catch (error) {
      setErrorMessage("Hiba a posztok betöltésekor!");
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPosts();
    } else {
      setErrorMessage("Kérlek, jelentkezz be a saját posztok megtekintéséhez!");
    }
  }, [userId]);

  const handleCheckboxChange = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const handleSearch = () => {
    let filtered = posts.filter((post) =>
      Number(post.userID) === userId && (
        post.vezeteknev.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.keresztnev.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.leiras.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (selectedCategory) {
      filtered = filtered.filter((post) => post.kategoria === selectedCategory);
    }
    if (location) {
      filtered = filtered.filter((post) => post.telepules === location);
    }
    if (selectedOptions.length > 0) {
      filtered = filtered.filter((post) => selectedOptions.includes(post.allapot));
    }

    setFilteredPosts(filtered);
    setErrorMessage(filtered.length === 0 ? "❌ Ilyen hirdetés nincs!" : "");
  };

  const handleDeletePost = async (posztID) => {
    if (!window.confirm("Biztosan törölni szeretnéd ezt a posztot?")) return;

    try {
      const response = await fetch(`http://localhost:5020/api/poszt/${posztID}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        alert("Poszt sikeresen törölve!");
        fetchPosts();
      } else {
        alert("Hiba történt: " + data.message);
      }
    } catch (error) {
      console.error("Hiba a poszt törlésekor:", error);
      alert("Hiba történt a poszt törlésekor!");
    }
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
            <option value="">Válassz kategóriát!</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <label>Megye:</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">Válassz megyét!</option>
            {locations.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
    
          <br />
          <Link to="/posztotcsinalok"><button>Új poszt</button></Link>
        </div>
        <div className="posztok-content">
          <div className="posztok-list">
            {filteredPosts.length === 0 ? (
              <p>Nincsenek saját posztjaid!</p>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.posztID} className="post-item">
                  <div className="post-item-content">
                    <h3>{post.vezeteknev} {post.keresztnev}</h3>
                    <h4>{post.fejlec}</h4>
                    <p><span className="category-label">Kategória:</span> {post.kategoria}</p>
                    <p><span className="location-label">Település:</span> {post.telepules}</p>
                    <p><span className="phone-label">Telefonszám:</span> {post.telefonszam}</p>
                    <p>{post.leiras}</p>
                    {post.fotok && post.fotok.length > 0 && (
                      <div className="image-stack">
                        {post.fotok.map((foto, index) => (
                          <img
                            key={index}
                            src={`http://localhost:5020/uploads/${foto}`}
                            alt={`Post Image ${index}`}
                          />
                        ))}
                      </div>
                    )}
                    <p className="creation-date">
                      Létrehozás dátuma: {new Date(post.datum).toLocaleDateString("hu-HU")}
                    </p>
                    <button
                      onClick={() => handleDeletePost(post.posztID)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#ff4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginTop: "10px",
                      }}
                    >
                      Poszt törlése
                    </button>
                  </div>
                  <div className="profile-pic-container">
                    <img
                      className="post-item-profile-pic"
                      src={post.profilkep ? `http://localhost:5020/uploads/${post.profilkep}` : "/default-profile.png"}
                      alt="Profile Pic"
                      onError={(e) => (e.target.src = "/default-profile.png")}
                    />
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