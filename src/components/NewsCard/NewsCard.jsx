import React from 'react';
import { Link } from 'react-router-dom';
import './NewsCard.css'; 

function NewsCard({ news }) {
    if (!news) return null;

    return (
        <div className="news-card">
            <h3 className="card-category">{news.category}</h3>
            <img 
                src={news.imageUrl} 
                alt={news.title} 
                className="card-image" 
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/300x180/E0E0E0/333333?text=Sin+Imagen";
                }} 
            />
            <div className="card-content">
                <h4 className="card-title">{news.title}</h4>
                <p className="card-subtitle">{news.subtitle}</p>
                <Link to={`/noticia/${news.id}`} className="card-link">
                    Leer más →
                </Link>
            </div>
        </div>
    );
}

export default NewsCard;