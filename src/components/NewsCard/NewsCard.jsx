import { Link } from 'react-router-dom';

function NewsCard({ news }) {
    return (
        <div className="news-card">
            <div className="news-card-image-container">
                <img
                    src={news.imageUrl}
                    alt={news.title}
                    className="news-card-image"
                />
            </div>

            <div className="news-card-content">
                {/* ❌ LÍNEA ELIMINADA: Ya no se muestra la categoría en la tarjeta individual */}
                
                <h3>{news.title}</h3>
                <p>{news.subtitle}</p>
                
                <Link to={`/noticia/${news.id}`} className="read-more-link">
                    Leer más →
                </Link>
            </div>
        </div>
    );
}

export default NewsCard;