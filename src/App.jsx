import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar.jsx'; // Asegúrate de que esta ruta sea correcta
import Footer from './components/Footer/Footer.jsx'; // Asegúrate de que esta ruta sea correcta

function App() { // Esta es la función Layout
  return (
    <div> 
      <Navbar /> 
      <main className="flex-grow-main"> 
        <Outlet /> 
      </main>
      <Footer /> 
    </div>
  );
}

export default App;