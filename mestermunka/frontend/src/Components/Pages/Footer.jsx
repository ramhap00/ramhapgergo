import React from 'react';
import "../Stilusok/Footer.css";

// Képek importálása az assets mappából
import InstagramIcon from '../../assets/instagram.png';
import FacebookIcon from '../../assets/facebook.png';
import XIcon from '../../assets/X.png';

const Footer = () => {
  return (
    <>
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-text">
            <p>© 2025 Minden jog fenntartva - S.O.S. Munka</p>
          </div>
          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <img src={InstagramIcon} alt="Instagram" className="social-icon" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <img src={FacebookIcon} alt="Facebook" className="social-icon" />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer">
              <img src={XIcon} alt="X" className="social-icon" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;