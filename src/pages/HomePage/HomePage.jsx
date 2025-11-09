// src/pages/HomePage/HomePage.jsx

import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const newsCollectionRef = collection(db, 'news');
    
    // 1. Consulta CLAVE: Solo traer noticias con status == 'Publicado'
    const q = query(
      newsCollectionRef,
      where('status', '==', 'Publicado') 
    );

    // Escuchamos en tiempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Mapeamos los datos y los agrupamos por categoría
      const groupedNews = snapshot.docs.reduce((acc, doc) => {
        const item = { id: doc.id, ...doc.data() };
        const category = item.category || 'Sin Categoría';
        
        // Agrupamos la noticia en la categoría correcta
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      }, {});
      
      setNews(groupedNews);
      setLoading(false);
    }, (error) => {
      console.error("Error al obtener noticias públicas:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading-public">Cargando el portal de noticias...</div>;
  }

  return (
    <div className="home-page-container">
      <h1>Portal de Noticias Corporativas</h1>
      
      {/* Mapeamos el objeto de noticias agrupadas */}
      {Object.entries(news).map(([category, newsList]) => (
        <section key={category} className="news-section">
          <h2>{category}</h2>
          <div className="news-grid">
            {newsList.map(item => (
              <div key={item.id} className="news-card">
                <img src={item.imageUrl} alt={item.title} className="news-card-image" />
                <div className="news-card-content">
                  <h3>{item.title}</h3>
                  <p>{item.subtitle}</p>
                  {/* 2. Enlace a la vista individual (RF-12) */}
                  <Link to={`/noticia/${item.id}`} className="read-more-link">
                    Leer más
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {Object.keys(news).length === 0 && (
          <p>Aún no hay noticias publicadas. ¡Pide a tu Editor que publique una!</p>
      )}
    </div>
  );
}

export default HomePage;