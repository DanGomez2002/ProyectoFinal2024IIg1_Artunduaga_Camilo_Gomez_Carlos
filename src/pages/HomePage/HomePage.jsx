import { useState, useEffect } from "react";
import { db } from "../../firebase"; // Importación limpia
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import "./HomePage.css"; // Asegúrate de que este archivo exista

function HomePage() {
  const [news, setNews] = useState({}); // Cambiado a objeto para agrupar por categoría
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const newsCollectionRef = collection(db, "news");

    // Consulta CLAVE: Solo traer noticias con status == 'Publicado' (RF-14)
    const q = query(newsCollectionRef, where("status", "==", "Publicado"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Mapeamos los datos y los agrupamos por categoría
        const groupedNews = snapshot.docs.reduce((acc, doc) => {
          const item = { id: doc.id, ...doc.data() };
          const category = item.category || "Sin Categoría";

          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
          return acc;
        }, {});

        setNews(groupedNews);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener noticias públicas:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="home-page-container">
        <p className="no-news-message">Cargando el portal de noticias...</p>
      </div>
    );
  }

  return (
    <div className="home-page-container">
      <h1>Portal de Noticias Corporativas</h1>

      {/* Mapeamos el objeto de noticias agrupadas */}
      {Object.entries(news).map(([category, newsList]) => (
        <section key={category} className="news-section">
          <h2>{category}</h2>

          {/* news-grid activa la distribución de 4 columnas (CSS) */}
          <div className="news-grid">
            {newsList.map((item) => (
              <div key={item.id} className="news-card">
                {/* Contenedor corregido para que la imagen no se estire */}
                <div className="news-card-image-container">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="news-card-image"
                  />
                </div>

                <div className="news-card-content">
                  <h3>{item.title}</h3>
                  <p>{item.subtitle}</p>
                  <Link to={`/noticia/${item.id}`} className="read-more-link">
                    Leer más &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {Object.keys(news).length === 0 && (
        <p className="no-news-message">
          Aún no hay noticias publicadas. ¡Pide a tu Editor que publique una!
        </p>
      )}
    </div>
  );
}

export default HomePage;
