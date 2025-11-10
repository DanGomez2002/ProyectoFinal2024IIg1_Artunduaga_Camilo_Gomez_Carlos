import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase.js'; 
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext.jsx'; // Importamos el contexto de autenticación
import './NewsDetailPage.css'; 

function NewsDetailPage() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    // 1. Obtener el estado de carga y el usuario (renombrado a authLoading)
    const { currentUser, loading: authLoading } = useAuth();

    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 2. BLOQUEAR EL FETCH HASTA QUE AUTH HAYA TERMINADO DE CARGAR
        if (authLoading) return;

        const fetchNews = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const docRef = doc(db, 'news', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    
                    // LÓGICA DE ACCESO: 
                    // Si el usuario está autenticado (Editor/Reportero) O la noticia está Publicada, permitir el acceso.
                    if (data.status === 'Publicado' || currentUser) {
                        setNews(data);
                    } else {
                        // Si no está Publicado y no hay usuario autenticado, mostrar error
                        setError("La noticia solicitada no está disponible o no ha sido publicada.");
                        setNews(null);
                    }
                } else {
                    setError("Noticia no encontrada.");
                    setNews(null);
                }
            } catch (err) {
                // Esto podría capturar errores de permiso o de ID
                setError("Error al cargar la noticia. Revisa la consola para más detalles.");
                console.error(err);
                setNews(null);
            }
            setLoading(false);
        };
        fetchNews();
    // 3. Incluir authLoading en las dependencias
    }, [id, currentUser, authLoading]); 

    // Muestra el mensaje de carga del contexto O el loading interno
    if (loading || authLoading) {
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
    
    // Si la noticia no existe o fue bloqueada
    if (!news) {
        return <div className="news-detail-loading">Noticia no encontrada o no tienes permisos.</div>;
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
                    <span>
                        Estado: <strong style={{ color: news.status === 'Publicado' ? 'green' : 'orange' }}>{news.status}</strong>
                    </span>
                    <span>Publicado: {news.createdAt?.toDate().toLocaleDateString()}</span> 
                </div>
                
                <p className="article-content">{news.content}</p>

            </article>
        </div>
    );
}

export default NewsDetailPage;