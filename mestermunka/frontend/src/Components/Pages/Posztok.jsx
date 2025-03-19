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
        console.error("Hiba a posztok, értékelések vagy időpontok betöltésekor:", error.message);
      }
    };

    fetchPostsAndRatings();

    // Időnkénti frissítés a naptárhoz, ha nyitva van
    let interval;
    if (isCalendarOpen && selectedPost) {
      interval = setInterval(() => {
        refreshBookedTimes(selectedPost.posztID);
      }, 5000); // 5 másodpercenként
    }

    return () => {
      if (interval) clearInterval(interval); // Tisztítás
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
  };

  const handleCalendarOpen = (post) => {
    setSelectedPost(post);
    setIsCalendarOpen(true);
    refreshBookedTimes(post.posztID); // Azonnali frissítés a naptár megnyitásakor
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

  const currentUserId = getCurrentUserId();

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
                  <h4>{post.fejlec}</h4>
                  <p>Kategória: {post.kategoria}</p>
                  <p>Település: {post.telepules}</p>
                  <p>Telefonszám: {post.telefonszam}</p>
                  <p>{post.leiras}</p>
                  <img
                    src={`http://localhost:5020/uploads/${post.fotok}`}
                    alt="Post Image"
                    style={{ width: "150px", height: "auto", objectFit: "cover", borderRadius: "8px" }}
                  />
                  <div className="stars">{renderStars(post)}</div>
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
                        marginTop: "10px",
                      }}
                    >
                      Írj rám
                    </button>
                  )}
                  <p>Létrehozás dátuma: {new Date(post.datum).toLocaleDateString("hu-HU")}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCalendarOpen(post);
                    }}
                    style={{ marginTop: "10px" }}
                  >
                    Naptár
                  </button>
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
            <img
              src={`http://localhost:5020/uploads/${selectedPost.fotok}`}
              alt="Post Image"
              style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: "8px" }}
            />
            <div className="stars">{renderStars(selectedPost)}</div>
            <button onClick={handleCloseModal}>Bezárás</button>
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
    </div>
  );
};

export default Posztok;