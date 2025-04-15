import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../Stilusok/Posztok.css";

const Posztok = () => {
  const navigate = useNavigate();

  const getTokenFromCookie = () => {
    const cookies = document.cookie.split("; ").find(row => row.startsWith("authToken="))?.split("=")[1];
    return cookies || null;
  };

  const getCurrentUserId = () => {
    const token = getTokenFromCookie();
    if (token) {
      const decoded = jwtDecode(token);
      return decoded.userID;
    }
    return null;
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
  const [ratings, setRatings] = useState({});
  const [hoverRating, setHoverRating] = useState(0);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [bookedTimes, setBookedTimes] = useState({});
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isOpinionsModalOpen, setIsOpinionsModalOpen] = useState(false);
  const [opinions, setOpinions] = useState([]);
  const [newOpinion, setNewOpinion] = useState("");

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

  const options = ["Elérhető", "Nem elérhető"];
  const daysOfWeek = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  const currentDate = new Date(2025, 2, 1);
  const monthNames = [
    "Január", "Február", "Március", "Április", "Május", "Június",
    "Július", "Augusztus", "Szeptember", "Október", "November", "December"
  ];

  const getWeekDates = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() + currentWeekOffset * 7);
    const dayOfWeek = weekStart.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    weekStart.setDate(weekStart.getDate() + diffToMonday);

    const weekDates = [];
    const dayToDateMap = {};

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      weekDates.push(date.getDate());
      dayToDateMap[daysOfWeek[i]] = {
        day: date.getDate(),
        fullDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      };
    }

    return { weekDates, dayToDateMap, month: monthNames[weekStart.getMonth()], year: weekStart.getFullYear() };
  };

  const { weekDates, dayToDateMap, month, year } = getWeekDates();

  useEffect(() => {
    const fetchPostsAndRatings = async () => {
      try {
        const postsResponse = await fetch("http://localhost:5020/api/posztok");
        if (!postsResponse.ok) throw new Error(`HTTP hiba! Státusz: ${postsResponse.status}`);
        const postsData = await postsResponse.json();
        if (postsData.success) {
          setPosts(postsData.posts);
          setFilteredPosts(postsData.posts);

          const token = getTokenFromCookie();
          if (token) {
            const ratingsData = {};
            const bookedTimesData = {};
            const favoritesResponse = await fetch("http://localhost:5020/api/kedvencek", {
              headers: { "Authorization": `Bearer ${token}` },
              credentials: "include",
            });
            const favoritesData = await favoritesResponse.json();
            if (favoritesData.success) {
              setFavorites(favoritesData.favorites.map(fav => fav.posztID));
            }

            const onlineStatusPromises = postsData.posts.map(async (post) => {
              try {
                const onlineResponse = await fetch(`http://localhost:5020/api/user-status/${post.userID}`, {
                  headers: { "Authorization": `Bearer ${token}` },
                  credentials: "include",
                });
                if (!onlineResponse.ok) {
                  console.error(`Hiba a user-status lekérdezéskor (${post.userID}): ${onlineResponse.status}`);
                  return null;
                }
                const onlineData = await onlineResponse.json();
                return onlineData.isOnline ? post.userID : null;
              } catch (err) {
                console.error(`Hiba a user-status lekérdezéskor (${post.userID}):`, err.message);
                return null;
              }
            });
            const onlineUsersData = (await Promise.all(onlineStatusPromises)).filter(id => id !== null);
            setOnlineUsers(onlineUsersData);

            await Promise.all(
              postsData.posts.map(async (post) => {
                const ratingResponse = await fetch(`http://localhost:5020/api/user-rating/${post.posztID}`, {
                  headers: { "Authorization": `Bearer ${token}` },
                  credentials: "include",
                });
                const ratingData = await ratingResponse.json();
                if (ratingData.success && ratingData.rating > 0) {
                  ratingsData[post.posztID] = ratingData.rating;
                }

                const bookedResponse = await fetch(`http://localhost:5020/api/booked-times/${post.posztID}`, {
                  headers: { "Authorization": `Bearer ${token}` },
                  credentials: "include",
                });
                const bookedData = await bookedResponse.json();
                if (bookedData.success) {
                  bookedTimesData[post.posztID] = bookedData.times || [];
                }
              })
            );
            setRatings(ratingsData);
            setBookedTimes(bookedTimesData);
          }
        }
      } catch (error) {
        console.error("Hiba a posztok, értékelések, időpontok vagy online státusz betöltésekor:", error.message);
      }
    };

    fetchPostsAndRatings();

    let interval;
    if (isCalendarOpen && selectedPost) {
      interval = setInterval(() => {
        refreshBookedTimes(selectedPost.posztID);
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCalendarOpen, selectedPost]);

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
    if (showFavorites) {
      filtered = filtered.filter(post => favorites.includes(post.posztID));
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

  const handleImageClick = (images) => {
    setSelectedImages(images);
    setCurrentImageIndex(0);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImages([]);
    setCurrentImageIndex(0);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % selectedImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + selectedImages.length) % selectedImages.length);
  };

  const handleRating = async (postId, rating) => {
    const token = getTokenFromCookie();
    if (!token) {
      alert("Kérlek, jelentkezz be az értékeléshez!");
      return;
    }

    if (ratings[postId]) return;

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

  const renderStars = (post, isFilter = false) => {
    if (isFilter) {
      // Szűrő csillagok
      let stars = [];
      for (let i = 0; i <= 0; i++) { // Csak egy csillag a szűrőnél
        stars.push(
          <span
            key={i}
            className={`star ${showFavorites ? "filled" : ""}`}
            style={{
              color: showFavorites ? "gold" : "gray",
              cursor: "pointer",
              fontSize: "24px",
            }}
            onClick={() => {
              setShowFavorites(!showFavorites);
              handleSearch();
            }}
          >
            ★
          </span>
        );
      }
      return (
        <div className="flex justify-content-center align-items-center">
          <p>Kedvencek szűrése   </p>
          <p className="mx-3">{stars} </p>
        </div>
      );
    } else {
      // Poszt csillagok
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
              cursor: userRating ? "default" : "pointer",
            }}
            onMouseEnter={() => !userRating && setHoverRating(i)}
            onMouseLeave={() => !userRating && setHoverRating(0)}
            onClick={() => !userRating && handleRating(postId, i)}
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
    }
  };

  const handleFavorite = async (postId) => {
    const token = getTokenFromCookie();
    if (!token) {
      alert("Kérlek, jelentkezz be a kedvencek kezeléséhez!");
      return;
    }

    const isFavorited = favorites.includes(postId);

    try {
      if (isFavorited) {
        const response = await fetch("http://localhost:5020/api/kedvencek/remove", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ postId }),
        });
        const data = await response.json();
        if (data.success) {
          setFavorites((prev) => prev.filter((id) => id !== postId));
          handleSearch();
        } else {
          console.error("Hiba a kedvenc eltávolításakor:", data.message, data.error || "");
        }
      } else {
        const response = await fetch("http://localhost:5020/api/kedvencek", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ postId }),
        });
        const data = await response.json();
        if (data.success) {
          setFavorites((prev) => [...prev, postId]);
          handleSearch();
        } else {
          console.error("Hiba a kedvenc hozzáadásakor:", data.message, data.error || "");
        }
      }
    } catch (error) {
      console.error("Hiba a kedvencek kezelésekor:", error.message);
    }
  };

  const handleCalendarOpen = (post) => {
    setSelectedPost(post);
    setIsCalendarOpen(true);
    refreshBookedTimes(post.posztID);
  };

  const handleCalendarClose = () => {
    setIsCalendarOpen(false);
    setSelectedDay("");
    setSelectedPost(null);
  };

  const refreshBookedTimes = async (postId) => {
    const token = getTokenFromCookie();
    try {
      const response = await fetch(`http://localhost:5020/api/booked-times/${postId}`, {
        headers: { "Authorization": `Bearer ${token}` },
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setBookedTimes((prev) => ({
          ...prev,
          [postId]: data.times || [],
        }));
      }
    } catch (error) {
      console.error("Hiba a foglalt időpontok frissítésekor:", error);
    }
  };

  const handleBookTime = async (postId, day, hour) => {
    const token = getTokenFromCookie();
    if (!token) {
      alert("Kérlek, jelentkezz be az időpont foglalásához!");
      return;
    }

    const selectedDate = dayToDateMap[day].fullDate;
    const bookingTime = `${selectedDate} ${hour}`;

    if (bookedTimes[postId]?.includes(bookingTime)) {
      alert("Ez az időpont már foglalt!");
      return;
    }

    const confirmBooking = window.confirm(`Biztosan ezt az időpontot szeretnéd kiválasztani: ${month} ${dayToDateMap[day].day}. ${hour}?`);
    if (!confirmBooking) return;

    try {
      const response = await fetch("http://localhost:5020/api/book-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ postId, day: selectedDate, hour }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
      } else {
        alert("Hiba történt: " + (data.error?.message || data.message));
      }
    } catch (error) {
      console.error("Hiba az időpont foglalásakor:", error);
      alert("Hiba történt az időpont foglalásakor: " + error.message);
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeekOffset((prev) => prev - 1);
    setSelectedDay("");
  };

  const handleNextWeek = () => {
    setCurrentWeekOffset((prev) => prev + 1);
    setSelectedDay("");
  };

  const handleWriteToUser = (post) => {
    const token = getTokenFromCookie();
    if (!token) {
      alert("Kérlek, jelentkezz be az üzenetküldéshez!");
      return;
    }
    navigate("/beszelgetesek", {
      state: {
        user: {
          id: post.userID,
          name: `${post.vezeteknev} ${post.keresztnev}`,
          profilePic: post.profilkep || "default-profile.png",
        },
      },
    });
  };

  const handleOpinionsOpen = async (post) => {
    setSelectedPost(post);
    setIsOpinionsModalOpen(true);
    await fetchOpinions(post.posztID);
  };

  const handleOpinionsClose = () => {
    setIsOpinionsModalOpen(false);
    setSelectedPost(null);
    setOpinions([]);
    setNewOpinion("");
  };

  const fetchOpinions = async (postId) => {
    const token = getTokenFromCookie();
    try {
      const response = await fetch(`http://localhost:5020/api/velemenyek/${postId}`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setOpinions(data.opinions || []);
      } else {
        console.error("Hiba a vélemények betöltésekor:", data.message);
      }
    } catch (error) {
      console.error("Hiba a vélemények lekérésekor:", error);
    }
  };

  const handleAddOpinion = async () => {
    if (!newOpinion.trim()) {
      alert("Kérlek írj véleményt!");
      return;
    }

    const token = getTokenFromCookie();
    if (!token) {
      alert("Kérlek, jelentkezz be a vélemény hozzáadásához!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5020/api/velemenyek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ 
          postId: selectedPost.posztID, 
          text: newOpinion 
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewOpinion("");
        fetchOpinions(selectedPost.posztID);
      } else {
        alert("Hiba történt: " + (data.error?.message || data.message));
      }
    } catch (error) {
      console.error("Hiba a vélemény hozzáadásakor:", error);
      alert("Hiba történt a vélemény hozzáadásakor: " + error.message);
    }
  };

  const currentUserId = getCurrentUserId();

  return (
    <div className="posztok-container">
      <div className="posztok-layout">
        <div className="posztok-filter">
          <h2>Szűrők</h2>
          
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
          <div className="status-item">
            {renderStars(null, true)}
          </div>
          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Keresés..."
            />
            <button className="button1" onClick={handleSearch}>🔎</button>
          </div>
        </div>
        <div className="posztok-content">
          <div className="posztok-list">
            {filteredPosts.length === 0 ? (
              <p>Nincs ilyen poszt!</p>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.posztID} className="post-item" onClick={() => handlePostClick(post)}>
                  <div className="post-item-content">
                    <h3>{post.vezeteknev} {post.keresztnev}</h3>
                    <h4>{post.fejlec}</h4>
                    <p><span className="category-label">Kategória:</span> {post.kategoria}</p>
                    <p><span className="location-label">Megye:</span> {post.telepules}</p>
                    <p><span className="phone-label">Telefonszám:</span> {post.telefonszam}</p>
                    <p>{post.leiras}</p>
                    {post.fotok && post.fotok.length > 0 && (
                      <div className="image-stack" onClick={(e) => { e.stopPropagation(); handleImageClick(post.fotok); }}>
                        {post.fotok.map((foto, index) => (
                          <img
                            key={index}
                            src={`http://localhost:5020/uploads/${foto}`}
                            alt={`Post Image ${index}`}
                          />
                        ))}
                      </div>
                    )}
                    <div className="stars">{renderStars(post)}</div>
                    <p className="creation-date">
                      Létrehozás dátuma: {new Date(post.datum).toLocaleDateString("hu-HU")}
                    </p>
                    <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                      {currentUserId !== post.userID && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWriteToUser(post);
                          }}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#007bff",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Írj rám
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCalendarOpen(post);
                        }}
                        style={{ padding: "5px 10px" }}
                      >
                        Időpont foglalás
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpinionsOpen(post);
                        }}
                        style={{ padding: "5px 10px" }}
                      >
                        Vélemények
                      </button>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavorite(post.posztID);
                        }}
                        style={{
                          fontSize: "24px",
                          cursor: "pointer",
                          color: favorites.includes(post.posztID) ? "gold" : "gray",
                        }}
                      >
                        {favorites.includes(post.posztID) ? "★" : "☆"}
                      </span>
                    </div>
                  </div>
                  <div className="profile-pic-container">
                    <img
                      className="post-item-profile-pic"
                      src={post.profilkep ? `http://localhost:5020/uploads/${post.profilkep}?t=${Date.now()}` : "/default-profile.png"}
                      alt="Profile Pic"
                      onError={(e) => {
                        e.target.src = "/default-profile.png";
                      }}
                    />
                    {onlineUsers.includes(post.userID) && <span className="online-indicator"></span>}
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
            <p><strong>Kategória:</strong> {selectedPost.kategoria}</p>
            <p><strong>Település:</strong> {selectedPost.telepules}</p>
            <p><strong>Telefonszám:</strong> {selectedPost.telefonszam}</p>
            <p>{selectedPost.leiras}</p>
            {selectedPost.fotok && selectedPost.fotok.length > 0 && (
              <div className="image-stack" onClick={() => handleImageClick(selectedPost.fotok)}>
                {selectedPost.fotok.map((foto, index) => (
                  <img
                    key={index}
                    src={`http://localhost:5020/uploads/${foto}`}
                    alt={`Post Image ${index}`}
                  />
                ))}
              </div>
            )}
            <div className="stars">{renderStars(selectedPost)}</div>
            <button onClick={handleCloseModal}>Bezárás</button>
          </div>
        </div>
      )}

      {isImageModalOpen && selectedImages.length > 0 && (
        <div className="image-modal" onClick={handleCloseImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={`http://localhost:5020/uploads/${selectedImages[currentImageIndex]}`}
              alt={`Image ${currentImageIndex}`}
            />
            {selectedImages.length > 1 && (
              <>
                <button className="nav-button left" onClick={handlePrevImage}>⬅️</button>
                <button className="nav-button right" onClick={handleNextImage}>➡️</button>
              </>
            )}
            <button className="close-button" onClick={handleCloseImageModal}>✖</button>
          </div>
        </div>
      )}

      {isCalendarOpen && selectedPost && (
        <div className="modal-overlay" onClick={handleCalendarClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="calendar-navigation">
              <button onClick={handlePreviousWeek} className="nav-button">⬅️</button>
              <h2>Naptár - {month} {year}</h2>
              <button onClick={handleNextWeek} className="nav-button">➡️</button>
            </div>
            <div className="calendar-days">
              <div className="calendar-header">
                {daysOfWeek.map((day, index) => (
                  <div key={day} className="calendar-day-header">
                    <span>{weekDates[index]}</span>
                  </div>
                ))}
              </div>
              <div className="calendar-day-buttons">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      backgroundColor: selectedDay === day ? "#007bff" : "#f0f0f0",
                      color: selectedDay === day ? "#fff" : "#000",
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            {selectedDay && (
              <div className="calendar-hours">
                {hours.map((hour) => {
                  const bookingTime = `${dayToDateMap[selectedDay].fullDate} ${hour}`;
                  const isBooked = bookedTimes[selectedPost.posztID]?.includes(bookingTime);
                  return (
                    <button
                      key={hour}
                      onClick={() => handleBookTime(selectedPost.posztID, selectedDay, hour)}
                      style={{
                        backgroundColor: isBooked ? "#666" : "#ccc",
                        cursor: isBooked ? "not-allowed" : "pointer",
                        margin: "5px",
                      }}
                      disabled={isBooked}
                    >
                      {hour}
                    </button>
                  );
                })}
              </div>
            )}
            <button onClick={handleCalendarClose}>Bezárás</button>
          </div>
        </div>
      )}

      {isOpinionsModalOpen && selectedPost && (
        <div className="modal-overlay" onClick={handleOpinionsClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Vélemények - {selectedPost.fejlec}</h2>
            <h3>{selectedPost.vezeteknev} {selectedPost.keresztnev}</h3>
            
            <div className="opinions-list" style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "20px" }}>
              {opinions.length === 0 ? (
                <p>Még nincsenek vélemények.</p>
              ) : (
                opinions.map((opinion, index) => (
                  <div key={index} style={{ 
                    border: "1px solid #ddd", 
                    borderRadius: "5px", 
                    padding: "10px", 
                    marginBottom: "10px",
                    backgroundColor: "#f9f9f9" 
                  }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
                      <img 
                        src={opinion.profilkep ? `http://localhost:5020/uploads/${opinion.profilkep}` : "/default-profile.png"} 
                        alt="Profile" 
                        style={{ width: "30px", height: "30px", borderRadius: "50%", marginRight: "10px" }}
                        onError={(e) => {
                          e.target.src = "/default-profile.png";
                        }}
                      />
                      <strong>{opinion.vezeteknev} {opinion.keresztnev}</strong>
                      <span style={{ marginLeft: "auto", fontSize: "12px", color: "#666" }}>
                        {new Date(opinion.datum).toLocaleDateString("hu-HU", { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p style={{ margin: "5px 0" }}>{opinion.szoveg}</p>
                  </div>
                ))
              )}
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <h4>Új vélemény hozzáadása</h4>
              <textarea
                value={newOpinion}
                onChange={(e) => setNewOpinion(e.target.value)}
                placeholder="Írj véleményt..."
                style={{ 
                  width: "100%", 
                  minHeight: "80px", 
                  padding: "8px", 
                  marginBottom: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ddd"
                }}
              />
              <button 
                onClick={handleAddOpinion}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginRight: "10px"
                }}
              >
                Küldés
              </button>
            </div>
            
            <button onClick={handleOpinionsClose}>Bezárás</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posztok;