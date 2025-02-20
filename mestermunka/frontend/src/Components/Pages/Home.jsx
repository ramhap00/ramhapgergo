import { motion } from "framer-motion";
import "../Stilusok/Home.css"; 
import workersBg from "/src/assets/workers-bg.jpg";



const Home = () => {
  return (
    <motion.div 
      initial={{ opacity: 10, y: 50 }} 
      animate={{ opacity: 10, y: 0 }} 
      transition={{ duration: 2 }}
      className="image-container"
    >
      <img src={workersBg} alt="Workers" className="faded-image" />
    </motion.div>
  );
};

export default Home;
