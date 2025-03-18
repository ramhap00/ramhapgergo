import { motion } from "framer-motion";
import "../Stilusok/Home.css"; 
import workersBg from "/src/assets/hatterkep1.png";

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
    <div className="home-container">
      {/* Háttérkép */}
      <div className="image-container">
        <img src={workersBg} alt="Munkások" className="background-image" />
      </div>

      {/* Tartalom konténer */}
      <div className="content-container">
        {/* Középen lévő szöveg */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2 }}
          className="center-text"
        >
          <h2>Üdvözlünk az S.O.S. Munka Weboldalán! </h2>
          <h4>Miért jó az S.O.S. Munkát választani?</h4>
          <h6>Oldalunk fő lényege a minnél gyorsabb és eredményesebb munkakeresés</h6>
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
          <motion.div 
            className="block"
            variants={blockVariants}
          >
            <p>
              Weboldalunkon a munkáltatók és vendégek egyaránt gyorsan megtalálják egymást. 
              A posztok világosak, így egy pillantás alatt eldöntheted, mi érdekel. 
              Az egyszerű felületünkkel időt takarítasz meg a keresgélés helyett. 
              Próbáld ki, és tapasztald meg a hatékonyságot!
            </p>
          </motion.div>
          <motion.div 
            className="block"
            variants={blockVariants}
          >
            <p>
              Az S.O.S. Munka célja, hogy a munkaközvetítés gyors és átlátható legyen. 
              Munkáltatóként pár lépésben posztolhatod a feladataidat, vendégként pedig választhatsz. 
              Az oldalunk intuitív dizájnja biztosítja, hogy bárki könnyen eligazodjon. 
              Csatlakozz hozzánk, és egyszerűsítsd a munkakeresést!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;