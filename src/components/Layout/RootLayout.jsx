import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar.jsx';
import Footer from '../Footer/Footer.jsx';

function RootLayout() { 
  return (
    // Agregamos 'flex-col min-h-screen' para el diseño de sticky footer
    <div className="flex flex-col min-h-screen"> 
      
      <Navbar /> 
      
      {/* La clase flex-grow-main empuja el footer hacia abajo */}
      <main className="flex-grow-main"> 
        <Outlet /> 
      </main>
      
      <Footer /> 
    </div>
  );
}

export default RootLayout;