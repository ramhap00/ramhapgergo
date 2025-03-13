import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Stilusok/Posztok.css"; // Használjuk a Posztok.css-t az egységes kinézetért

const IdopontFoglalasok = () => {
  const [bookings, setBookings] = useState([]);

  // Foglalások betöltése
  useEffect(() => {
    axios
      .get("http://localhost:5020/api/user-bookings", { withCredentials: true })
      .then((response) => {
        if (response.data.success) {
          setBookings(response.data.bookings);
        }
      })
      .catch((error) => {
        console.error("Hiba a foglalások betöltésekor:", error);
      });
  }, []);

  // Foglalás törlése
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

  return (
    <div className="posztok-container">
      <h1>Foglalt időpontjaim</h1>
      {bookings.length === 0 ? (
        <p>Még nem foglaltál időpontot.</p>
      ) : (
        <div className="posztok-list">
          {bookings.map((booking) => (
            <div key={booking.naptarID} className="poszt">
              <h2>{booking.fejlec}</h2>
              <p><strong>Kategória:</strong> {booking.kategoria}</p>
              <p><strong>Leírás:</strong> {booking.leiras}</p>
              <p><strong>Település:</strong> {booking.telepules}</p>
              <p><strong>Telefonszám:</strong> {booking.telefonszam}</p>
              <p><strong>Dátum:</strong> {booking.datum}</p>
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
  );
};

export default IdopontFoglalasok;