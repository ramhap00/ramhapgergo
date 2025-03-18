import { motion } from "framer-motion";
import "../Stilusok/Home.css"; 
import workersBg from "/src/assets/hatterkep1.png";

const Home = () => {
  // Animációs változatok az oldalsó tömbökhöz
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
          <h6>aefn</h6>
        </motion.div>

        {/* Oldalsó tömbök konténere */}
        <div className="blocks-container">
          {/* Bal oldali tömbök */}
          <div className="left-blocks">
            <motion.div 
              className="block"
              variants={blockVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
            >
              <p>Random szöveg 1: Itt bármi lehet, például előnyök.</p>
            </motion.div>
            <motion.div 
              className="block"
              variants={blockVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
            >
              <p>Random szöveg 2: Gyors munkakezdés, jó fizetés.</p>
            </motion.div>
          </div>

          {/* Jobb oldali tömbök */}
          <div className="right-blocks">
            <motion.div 
              className="block"
              variants={blockVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
            >
              <p>Random szöveg 3: Rugalmas időbeosztás.</p>
            </motion.div>
            <motion.div 
              className="block"
              variants={blockVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
            >
              <p>Random szöveg 4: Csapatszellem és támogatás.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;