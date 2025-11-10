import { useState, useEffect } from 'react';
import { db } from '../../firebase.js';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import NewsCard from '../../components/NewsCard/NewsCard.jsx'; 
import './HomePage.css'; 

function HomePage() {
    const [allNews, setAllNews] = useState({}); 
    const [sections, setSections] = useState([]); 
    const [selectedSection, setSelectedSection] = useState('Todas'); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- 1. Obtener todas las secciones disponibles ---
    useEffect(() => {
        const sectionsColRef = collection(db, 'sections');
        const unsubscribe = onSnapshot(sectionsColRef, (snapshot) => {
            const sectionsData = snapshot.docs.map(doc => doc.data().name);
            setSections(['Todas', ...sectionsData]); 
        }, (err) => {
            setError("Error al cargar las secciones.");
            console.error("Error al cargar secciones:", err);
        });
        return () => unsubscribe();
    }, []);

    // --- 2. Obtener y filtrar noticias ---
    useEffect(() => {
        if (sections.length === 0 && !error) return; 

        setLoading(true);
        setError(null);

        const newsCollectionRef = collection(db, 'news');
        let q;

        q = query(newsCollectionRef, where('status', '==', 'Publicado'));

        if (selectedSection !== 'Todas') {
            q = query(q, where('category', '==', selectedSection));
        }
        

        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                const newsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                const grouped = {};
                if (selectedSection === 'Todas') {
                    sections.filter(s => s !== 'Todas').forEach(sec => {
                        grouped[sec] = newsData.filter(n => n.category === sec);
                    });
                } else {
                    grouped[selectedSection] = newsData;
                }

                setAllNews(grouped);
                setLoading(false);
            },
            (err) => {
                setError("Error al cargar las noticias. Revisa las reglas de Firestore.");
                setLoading(false);
                console.error("Error al obtener noticias:", err);
            }
        );

        return () => unsubscribe();
    }, [sections, selectedSection]); 

    if (loading) {
        return <div className="loading-message">Cargando noticias y secciones...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="homepage-container">
            <h1 className="portal-title">Portal de Noticias Corporativas</h1>
            <div className="filter-bar">
                {sections.map(section => (
                    <button
                        key={section}
                        onClick={() => setSelectedSection(section)}
                        className={`filter-button ${selectedSection === section ? 'active' : ''}`}
                    >
                        {section}
                    </button>
                ))}
            </div>

            <div className="news-content">
                {/* Itera sobre los grupos (secciones) */}
                {Object.keys(allNews).map(sectionName => {
                    const newsInSection = allNews[sectionName];
                    
                    if (newsInSection.length === 0) {
                        return null; 
                    }

                    return (
                        <section key={sectionName} className="news-section">
                            <h2 className="section-title">{sectionName}</h2>
                            <div className="section-list">
                                {/* Muestra las tarjetas de noticias */}
                                {newsInSection.map(newsItem => (
                                    <NewsCard key={newsItem.id} news={newsItem} />
                                ))}
                            </div>
                        </section>
                    );
                })}
                
                {/* Manejar el caso de que el filtro activo no tenga noticias */}
                {Object.keys(allNews).length === 0 && selectedSection !== 'Todas' && (
                    <p className="no-results">No hay noticias publicadas en la sección "{selectedSection}" en este momento.</p>
                )}
            </div>
        </div>
    );
}

export default HomePage;