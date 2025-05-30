import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Stilusok/IdopontFoglalasok.css";
import profileBlank from "../../assets/profile-blank.png";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const IdopontFoglalasok = () => {
  const [bookings, setBookings] = useState([]);
  const [incomingBookings, setIncomingBookings] = useState([]);
  const [myPostsBookings, setMyPostsBookings] = useState([]);
  const [isEmployer, setIsEmployer] = useState(false); // Új állapot a munkáltató ellenőrzésére

  const getTokenFromCookie = () => {
    const cookies = document.cookie.split("; ");
    const authCookie = cookies.find((cookie) => cookie.startsWith("authToken="));
    return authCookie ? authCookie.split("=")[1] : null;
  };

  useEffect(() => {
    const token = getTokenFromCookie();
    if (!token) {
      console.error("Nincs token a sütikben!");
      return;
    }

    
    const decodedToken = jwtDecode(token);
    setIsEmployer(decodedToken.munkasreg === 1); 

    const fetchBookings = async () => {
      try {
        
        const bookingsResponse = await axios.get("http://localhost:5020/api/user-bookings", {
          withCredentials: true,
        });
        if (bookingsResponse.data.success) {
          setBookings(bookingsResponse.data.bookings || []);
        }

        
        if (decodedToken.munkasreg === 1) {
          const messagesResponse = await axios.get("http://localhost:5020/api/messages", {
            withCredentials: true,
          });
          if (messagesResponse.data.success) {
            const incoming = messagesResponse.data.messages.filter(
              (msg) => msg.allapot === "pending" && msg.cimzettID === decodedToken.userID
            );
            setIncomingBookings(incoming);
          }

          const myPostsBookingsResponse = await axios.get("http://localhost:5020/api/my-posts-bookings", {
            withCredentials: true,
          });
          if (myPostsBookingsResponse.data.success) {
            setMyPostsBookings(myPostsBookingsResponse.data.bookings || []);
          }
        }
      } catch (error) {
        console.error("Hiba a foglalások vagy kérelmek betöltésekor:", error);
      }
    };
    fetchBookings();
  }, []);

  const handleCancelBooking = (naptarID, postId, day, hour) => {
    const confirmCancel = window.confirm(`Biztosan törölni szeretnéd ezt a foglalást: ${day} ${hour}?`);
    if (!confirmCancel) return;

    axios
      .delete(`http://localhost:5020/api/cancel-booking/${naptarID}`, { withCredentials: true })
      .then((response) => {
        if (response.data.success) {
          alert("Foglalás sikeresen törölve!");
          setBookings((prev) => prev.filter((booking) => booking.naptarID !== naptarID));
        } else {
          alert("Hiba történt: " + response.data.message);
        }
      })
      .catch((error) => {
        console.error("Hiba a foglalás törlésekor:", error);
        alert("Hiba történt a foglalás törlésekor!");
      });
  };

  const handleAcceptBooking = async (uzenetID, posztID, nap, ora) => {
    if (!uzenetID || !posztID || !nap || !ora) {
      console.error("Hiányzó adatok:", { uzenetID, posztID, nap, ora });
      alert("Hiányzó vagy érvénytelen adatok a foglalás elfogadásához!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5020/api/accept-booking",
        { uzenetID, posztID, nap, ora },
        { withCredentials: true }
      );
      if (response.data.success) {
        alert(response.data.message);
        setIncomingBookings((prev) => prev.filter((msg) => msg.uzenetID !== uzenetID));
        const updatedBookings = await axios.get("http://localhost:5020/api/my-posts-bookings", {
          withCredentials: true,
        });
        if (updatedBookings.data.success) {
          setMyPostsBookings(updatedBookings.data.bookings || []);
        }
      } else {
        alert(response.data.message);
        if (response.data.message.includes("elutasítva")) {
          setIncomingBookings((prev) => prev.filter((msg) => msg.uzenetID !== uzenetID));
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Hiba az elfogadás során:", error.response?.data || error);
      alert(`Hiba történt az elfogadás során: ${errorMessage}`);
      if (errorMessage.includes("elutasítva")) {
        setIncomingBookings((prev) => prev.filter((msg) => msg.uzenetID !== uzenetID));
      }
    }
  };

  const handleRejectBooking = async (uzenetID) => {
    try {
      const response = await axios.put(
        "http://localhost:5020/api/update-message-status",
        { uzenetID, allapot: "rejected" },
        { withCredentials: true }
      );
      if (response.data.success) {
        alert(response.data.message);
        setIncomingBookings((prev) => prev.filter((msg) => msg.uzenetID !== uzenetID));
      }
    } catch (error) {
      console.error("Hiba az elutasítás során:", error);
      alert("Hiba történt az elutasítás során!");
    }
  };

  return (
    <div className="account-settings">
      <aside className="sidebar">
        <ul>
          <li className="active">
            <img src={profileBlank} alt="icon" className="menu-icon" />
            <Link to="/fiok" style={{ textDecoration: "none", color: "inherit" }}>
              Fiók beállítások
            </Link>
          </li>
          <br />
          <li style={{ fontWeight: "700", fontSize: "16px" }}>
            <img src={profileBlank} alt="icon" className="menu-icon" />
            <Link to="/jelszo" style={{ textDecoration: "none", color: "inherit" }}>
              Jelszó és biztonság
            </Link>
          </li>
          <br />
          <li style={{ fontWeight: "700", fontSize: "16px" }}>
            <img src={profileBlank} alt="icon" className="menu-icon" />
            <Link
              to="/idopont-foglalasok"
              style={{ textDecoration: "none", color: "inherit" }}
              onClick={() => console.log("Kattintás az Időpont foglalásokra!")}
            >
              Időpont foglalások
            </Link>
          </li>
          <br />
          <li style={{ fontWeight: "700", fontSize: "16px" }}>
            <img src={profileBlank} alt="icon" className="menu-icon" />
            <Link to="/premium" style={{ textDecoration: "none", color: "inherit" }}>
              Premium előfizetés
            </Link>
          </li>
        </ul>
      </aside>
      <div className="split-container">
        {isEmployer && (
          <div className="left-panel">
            <h2 className="bejovoText">Bejövő foglalási kérelmek</h2>
            {incomingBookings.length === 0 ? (
              <p>Nincs bejövő foglalási kérelem.</p>
            ) : (
              <div className="posztok-list">
                {incomingBookings.map((booking) => (
                  <div key={booking.uzenetID} className="poszt">
                    <h2 className="cim"><strong>{booking.fejlec || "Nincs cím"}</strong></h2>
                    <p><strong>Kategória:</strong> {booking.kategoria || "Nincs kategória"}</p>
                    <p><strong>Település:</strong> {booking.telepules || "Nincs település"}</p>
                    <p><strong>Leírás:</strong> {booking.leiras || "Nincs leírás"}</p>
                    <p><strong>Telefonszám:</strong> {booking.telefonszam || "Nincs telefonszám"}</p>
                    <p><strong>Foglalt időpont:</strong> {booking.nap} {booking.ora}</p>
                    {booking.fotok && (
                      <img
                        src={`http://localhost:5020/uploads/${booking.fotok}`}
                        alt="Poszt kép"
                        className="poszt-image"
                      />
                    )}
                    <button
                      onClick={() => handleAcceptBooking(booking.uzenetID, booking.posztID, booking.nap, booking.ora)}
                      className="accept-button"
                    >
                      Elfogad
                    </button>
                    <button
                      onClick={() => handleRejectBooking(booking.uzenetID)}
                      className="reject-button"
                    >
                      Elutasít
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div className={isEmployer ? "middle-panel" : "middle-panel full-width"}>
          <h2 className="sajatText">Saját foglalásaim</h2>
          {bookings.length === 0 ? (
            <p>Még nem foglaltál elfogadott időpontot.</p>
          ) : (
            <div className="posztok-list">
              {bookings.map((booking) => (
                <div key={booking.naptarID} className="poszt">
                  <h2 className="cim"><strong>{booking.fejlec || "Nincs cím"}</strong></h2>
                  <p><strong>Munkáltató Neve:</strong> {`${booking.vezeteknev} ${booking.keresztnev}` || "Nincs kategória"}</p>
                  <p><strong>Kategória:</strong> {booking.kategoria || "Nincs kategória"}</p>
                  <p><strong>Település:</strong> {booking.telepules || "Nincs település"}</p>
                  <p><strong>Leírás:</strong> {booking.leiras || "Nincs leírás"}</p>
                  <p><strong>Telefonszám:</strong> {booking.telefonszam || "Nincs telefonszám"}</p>
                  <p><strong>Foglalt időpont:</strong> {booking.nap} {booking.ora}</p>
                  {booking.fotok && (
                    <img
                      src={`http://localhost:5020/uploads/${booking.fotok}`}
                      alt="Poszt kép"
                      className="poszt-image"
                    />
                  )}
                  <button
                    onClick={() => handleCancelBooking(booking.naptarID, booking.posztID, booking.nap, booking.ora)}
                    className="cancel-button"
                  >
                    Foglalás lemondása
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {isEmployer && (
          <div className="right-panel">
            <h2 className="munkaltatoText">Időpontok</h2>
            {myPostsBookings.length === 0 ? (
              <p>Jelenleg nincsen foglalt időpont</p>
            ) : (
              <div className="posztok-list">
                {myPostsBookings.map((booking) => (
                  <div key={booking.naptarID} className="poszt">
                    <h2 className="cim"><strong>{booking.fejlec || "Nincs cím"}</strong></h2>
                    <p><strong>Kategória:</strong> {booking.kategoria || "Nincs kategória"}</p>
                    <p><strong>Település:</strong> {booking.telepules || "Nincs település"}</p>
                    <p><strong>Leírás:</strong> {booking.leiras || "Nincs leírás"}</p>
                    <p><strong>Telefonszám:</strong> {booking.telefonszam || "Nincs telefonszám"}</p>
                    <p><strong>Foglalt időpont:</strong> {booking.nap} {booking.ora}</p>
                    <p><strong>Foglaló neve:</strong> {`${booking.foglaloVezeteknev} ${booking.foglaloKeresztnev}` || "Nincs név"}</p>
                    {booking.fotok && (
                      <img
                        src={`http://localhost:5020/uploads/${booking.fotok}`}
                        alt="Poszt kép"
                        className="poszt-image"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IdopontFoglalasok;