import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Stilusok/IdopontFoglalasok.css";
import { jwtDecode } from "jwt-decode";
import workersBg from "/src/assets/hatterkep1.png";

const IdopontFoglalasok = () => {
  const [bookings, setBookings] = useState([]);
  const [incomingBookings, setIncomingBookings] = useState([]);
  const [pendingCount, setPendingCount] = useState(0); // Új állapot a pending kérelmekhez

  const getTokenFromCookie = () => {
    const cookies = document.cookie.split("; ");
    const authCookie = cookies.find((cookie) => cookie.startsWith("authToken="));
    return authCookie ? authCookie.split("=")[1] : null;
  };

  useEffect(() => {
    const fetchBookings = async () => {
      const token = getTokenFromCookie();
      if (!token) return;

      try {
        // Saját foglalások lekérése
        const bookingsResponse = await axios.get("http://localhost:5020/api/user-bookings", {
          withCredentials: true,
        });
        if (bookingsResponse.data.success) {
          setBookings(bookingsResponse.data.bookings || []);
        }

        // Bejövő foglalási kérelmek lekérése
        const messagesResponse = await axios.get("http://localhost:5020/api/messages", {
          withCredentials: true,
        });
        if (messagesResponse.data.success) {
          const incoming = messagesResponse.data.messages.filter(
            (msg) => msg.allapot === "pending" && msg.cimzettID === jwtDecode(token).userID
          );
          console.log("Bejövő foglalási kérelmek:", incoming);
          setIncomingBookings(incoming);
          setPendingCount(incoming.length); // Frissítjük a pending kérelmek számát
        }
      } catch (error) {
        console.error("Hiba a foglalások vagy kérelmek betöltésekor:", error);
      }
    };

    fetchBookings();
    const interval = setInterval(fetchBookings, 5000); // 5 másodpercenként frissít
    return () => clearInterval(interval); // Tisztítás
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
        setPendingCount((prev) => prev - 1); // Csökkentjük a pending számot
      } else {
        alert(response.data.message);
        if (response.data.message.includes("elutasítva")) {
          setIncomingBookings((prev) => prev.filter((msg) => msg.uzenetID !== uzenetID));
          setPendingCount((prev) => prev - 1);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Hiba az elfogadás során:", error.response?.data || error);
      alert(`Hiba történt az elfogadás során: ${errorMessage}`);
      if (errorMessage.includes("elutasítva")) {
        setIncomingBookings((prev) => prev.filter((msg) => msg.uzenetID !== uzenetID));
        setPendingCount((prev) => prev - 1);
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
        setPendingCount((prev) => prev - 1); // Csökkentjük a pending számot
      }
    } catch (error) {
      console.error("Hiba az elutasítás során:", error);
      alert("Hiba történt az elutasítás során!");
    }
  };

  return (
    <div className="posztok-container">
      <div className="image-container">
        <img src={workersBg} alt="Munkások" className="background-image" />
      </div>
      <div className="split-container">
        <div className="left-panel" style={{ backgroundColor: "lightblue" }}>
          <h2>Bejövő foglalási kérelmek ({pendingCount})</h2> {/* Pending szám megjelenítése */}
          {incomingBookings.length === 0 ? (
            <p>Nincs bejövő foglalási kérelem.</p>
          ) : (
            <div className="posztok-list">
              {incomingBookings.map((booking) => (
                <div key={booking.uzenetID} className="poszt">
                  <h2>{booking.fejlec || "Nincs cím"}</h2>
                  <p><strong>Kategória:</strong> {booking.kategoria || "Nincs kategória"}</p>
                  <p><strong>Leírás:</strong> {booking.leiras || "Nincs leírás"}</p>
                  <p><strong>Település:</strong> {booking.telepules || "Nincs település"}</p>
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
        <div className="right-panel" style={{ backgroundColor: "lightblue" }}>
          <h2>Saját foglalásaim</h2>
          {bookings.length === 0 ? (
            <p>Még nem foglaltál elfogadott időpontot.</p>
          ) : (
            <div className="posztok-list">
              {bookings.map((booking) => (
                <div key={booking.naptarID} className="poszt">
                  <h2>{booking.fejlec || "Nincs cím"}</h2>
                  <p><strong>Kategória:</strong> {booking.kategoria || "Nincs kategória"}</p>
                  <p><strong>Leírás:</strong> {booking.leiras || "Nincs leírás"}</p>
                  <p><strong>Település:</strong> {booking.telepules || "Nincs település"}</p>
                  <p><strong>Telefonszám:</strong> {booking.telefonszam || "Nincs telefonszám"}</p>
                  <p><strong>Dátum:</strong> {new Date(booking.datum).toLocaleDateString("hu-HU")}</p>
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
      </div>
    </div>
  );
};

export default IdopontFoglalasok;