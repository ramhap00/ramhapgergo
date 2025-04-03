import { motion } from "framer-motion";
import "../Stilusok/Home.css"; 
import backgroundImage from "../../assets/hatterkep1.png";
import logo from "../../assets/sosmunkalogo.png";


const Home = () => {
  // Animációs változatok az oldalsó tömbökhöz
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.5, // 0.5 másodpercenként jelenik meg egy-egy tömb
      },
    },
  };

  const blockVariants = {
    hidden: { opacity: 0, y: 20 }, // Kezdetben átlátszatlan és lentről indul
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1.5, ease: "easeOut" } // Láthatóvá válik 1.5 mp alatt
    }
  };

  return (
    <div className="home-container "style={{ backgroundImage: `url(${backgroundImage})` }}>
      {/* Háttérkép */}
      <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 50 }}
          transition={{ duration: 2 }}
          >
            
        <h2 className="udvozlunk">Üdvözlünk az S.O.S. Munka Weboldalán! </h2>
          </motion.div>
      {/* Tartalom konténer */}
      <div className="content-container bg-gray">
        {/* Középen lévő szöveg */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2 }}
          className="center-text" >
        </motion.div>
        <motion.div 
        initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2 }}>
        <h4 className="sos">Miért jó az S.O.S. Munkát választani?</h4>
        <p className="p">Oldalunk fő lényege a minnél gyorsabb és eredményesebb munkakeresés</p>
          </motion.div>
        {/* Oldalsó tömbök konténere */}
        <motion.div 
          className="blocks-container"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
        >
          <motion.div 
            className="block"
            variants={blockVariants}
          >
            <p>
              Munkáltatóként nálunk gyorsan és egyszerűen feladhatod a munkáidat. 
              Csak regisztrálj, írd meg a posztodat, és máris megtalálhatod a megfelelő embert. 
              Az oldalunk átlátható felülete segít, hogy ne vessz el a részletekben. 
              Így időt spórolhatsz, és hamar nekiállhatsz a feladatoknak!
            </p>
          </motion.div>
          <motion.div 
            className="block"
            variants={blockVariants}
          >
            <p>
              Vendégként nálunk könnyedén böngészhetsz a munkáltatók ajánlatai között. 
              Az oldalunk egyszerű keresője segít megtalálni a hozzád illő munkát. 
              Néhány kattintással kapcsolatba léphetsz a munkáltatóval, és már meg is egyezhettek. 
              Nincs bonyolult folyamat, csak gyors megoldások!
            </p>
          </motion.div>
        </motion.div>

    
        
        </div>
        <div className="footer"style={{ logo: `url(${logo})` }}></div>
       
      </div>
 
  );
};

export default Home;