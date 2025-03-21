import React from "react";
import "../Stilusok/Premium.css"; 

const Premium = () => {
  return (
    <div className="premium-container">
      <h1>S.O.S.Premium csomagjaink</h1>
      <p>Ez egy minta szöveg. Lorem ipsum dolor sit amet, consectetur adipiscing elit nullam nunc justo sagittis suscipit ultrices.</p>
      <div className="plans-wrapper">
        {/* Ingyenes csomag */}
        <div className="plan-card">
          <h2>Ingyenes</h2>
          <h3>0 Ft <span>havonta</span></h3>
          <ul>
            <li>5 felhasználó</li>
            <li>Funkció 2</li>
            <li>Funkció 3</li>
            <li>Funkció 4</li>
          </ul>
          <button className="plan-button">Fejlesztés alatt...</button>
        </div>

        {/* S.O.S. Premium csomag */}
        <div className="plan-card highlighted">
          <h2>S.O.S. Premium</h2>
          <h3>59 $ <span>havonta</span></h3>
          <ul>
            <li>15 felhasználó</li>
            <li>Funkció 2</li>
            <li>Funkció 3</li>
            <li>Funkció 4</li>
          </ul>
          <button className="plan-button">Fejlesztés alatt...</button>
        </div>

        {/* S.O.S. Premium Plus csomag */}
        <div className="plan-card">
          <h2>S.O.S. Premium Plus</h2>
          <h3>239 $ <span>havonta</span></h3>
          <ul>
            <li>Korlátlan felhasználó</li>
            <li>Funkció 2</li>
            <li>Funkció 3</li>
            <li>Funkció 4</li>
          </ul>
          <button className="plan-button">Fejlesztés alatt...</button>
        </div>
      </div>
    </div>
  );
};

export default Premium;