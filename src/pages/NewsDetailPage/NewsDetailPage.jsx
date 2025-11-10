import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase.js'; 
import { doc, getDoc } from 'firebase/firestore';
import './NewsDetailPage.css'; 

function NewsDetailPage() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const docRef = doc(db, 'news', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          
          if (data.status !== 'Publicado') {
            setError("La noticia solicitada no está disponible o no ha sido publicada.");
            setNews(null);
          } else {
            setNews(data);
          }
        } else {
          setError("Noticia no encontrada.");
        }
      } catch (err) {
        setError("Error al cargar la noticia.");
        console.error(err);
      }
      setLoading(false);
    };
    fetchNews();
  }, [id]);

  if (loading) {
    return <div className="news-detail-loading">Cargando noticia...</div>;
  }

  if (error) {
    return (
        <div className="news-detail-container">
            <p className="news-detail-error">{error}</p>
            <button onClick={() => navigate('/')} className="back-button">
                &larr; Volver al Portal
            </button>
        </div>
    );
  }
  
  return (
    <div className="news-detail-container">
      <button onClick={() => navigate('/')} className="back-button">
        &larr; Volver al Portal
      </button>
      
      <img src={news.imageUrl} alt={news.title} className="news-detail-image" />
      
      <article className="news-article">
        <h1>{news.title}</h1>
        <h2 className="subtitle">{news.subtitle}</h2>
        <div className="article-meta">
          <span>Categoría: <strong>{news.category}</strong></span>
          <span>Autor: {news.authorName || news.authorEmail}</span>
          <span>Publicado: {news.createdAt?.toDate().toLocaleDateString()}</span> 
        </div>
        
        <p className="article-content">{news.content}</p>

      </article>
      
    </div>
  );
}

export default NewsDetailPage;