// src/App.jsx

import { Outlet } from 'react-router-dom';

// (Aquí podríamos poner un Navbar o un Footer que se vea en todas las páginas)

function App() {
  return (
    <div className="app-container">
      {/* <h1>Mi Portal de Noticias</h1> */}

      <main>
        {/* 'Outlet' es el espacio donde se renderizarán 
            todas las páginas que definimos en main.jsx 
            (HomePage, LoginPage, etc.) */}
        <Outlet />
      </main>

      {/* <footer>Copyright 2025</footer> */}
    </div>
  );
}

export default App;