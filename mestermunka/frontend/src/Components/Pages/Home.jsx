import { motion } from "framer-motion";
import "../Stilusok/Home.css"; 
import backgroundImage from "../../assets/hatterkep1.png";
import logo from "../../assets/sosmunkalogo.png";


const Home = () => {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.5, 
      },
    },
  };

  const blockVariants = {
    hidden: { opacity: 0, y: 20 }, 
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1.5, ease: "easeOut" } 
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
        <p className="p">Oldalunk fő lényege hogy minnél gyorsabban megtaláld a számodra megfelelő szakmunkást!</p>
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
            <h1 style={{fontStyle:"italic"}}>Szeretnéd magad hirdetni?</h1>
            <p className="szoveg1">Regisztrálj szakmunkásként, majd a profilon belül kattints a "Posztjaim" gombra és hozd létre a saját hírdetésed!</p>
          </motion.div>
          <motion.div 
            className="block"
            variants={blockVariants}
          >
            <h1 style={{ fontStyle:"italic"}}>Tudtad?</h1>
            <p className="szoveg1">
              Üzenni tudsz a munkavállalónak majd időpontot foglalni, valamint értékelni is tudod őket csillagokkal és szövegesen is!
            </p>
          </motion.div>
          <motion.div 
            id="szoveg2" className="block"
            variants={blockVariants}
          >
            <h1 style={{ fontStyle:"italic"}}>Légy résen!</h1>
            <p className="szoveg1">
            Figyeld fent a csengőt és az üzeneteid, ha megkeresnek minnél gyorsabban válaszolj!
            </p>
          </motion.div>
        </motion.div>
    
        
        </div>
        <div className="footer"style={{ logo: `url(${logo})` }}></div>
       
      </div>
 
  );
};

export default Home;