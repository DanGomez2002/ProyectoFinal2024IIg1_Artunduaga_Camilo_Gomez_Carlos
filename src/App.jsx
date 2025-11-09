import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar.jsx';
import Footer from './components/Footer/Footer.jsx';

function App() {
  return (
    // Quitamos la clase "app-container". Dejamos que #root (en index.css) controle el layout.
    <div> 
      
      <Navbar /> 
      
      {/* La clase flex-grow-main ahora empuja el footer hacia abajo */}
      <main className="flex-grow-main"> 
        <Outlet /> 
      </main>
      
      <Footer /> 
    </div>
  );
}

export default App;