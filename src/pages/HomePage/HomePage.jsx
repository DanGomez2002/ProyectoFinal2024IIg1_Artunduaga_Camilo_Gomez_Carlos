import { useState, useEffect } from 'react';
import { db } from '../../firebase.js';
import { collection, query, where, onSnapshot } from 'firebase/firestore'; 
import NewsCard from '../../components/NewsCard/NewsCard.jsx'; 
import './HomePage.css'; 
// Importamos el hook
import useDebounce from '../../hooks/useDebounce.js'; 

function HomePage() {
    const [allNews, setAllNews] = useState({}); 
    const [sections, setSections] = useState([]); 
    const [selectedSection, setSelectedSection] = useState('Todas'); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Creamos el valor 'debounced' (la búsqueda real) con un retraso de 500ms
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

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

    // --- 2. Obtener y filtrar noticias (Utiliza el valor debounced) ---
    useEffect(() => {
        if (sections.length === 0 && !error) return; 

        setLoading(true);
        setError(null);

        const newsCollectionRef = collection(db, 'news');
        let q;

        // 1. Filtro base: solo noticias 'Publicado'
        q = query(newsCollectionRef, where('status', '==', 'Publicado'));

        // 2. Aplicar filtro de sección (solo si no estamos buscando)
        // Nota: Firestore solo permite un filtro 'where' por campo, 
        // por eso la búsqueda de texto se hace en memoria.
        if (selectedSection !== 'Todas' && !debouncedSearchTerm) {
            q = query(q, where('category', '==', selectedSection));
        }
        
        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                let newsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // FILTRADO POR TÍTULO EN MEMORIA (JavaScript)
                const trimmedSearch = debouncedSearchTerm.trim().toLowerCase();
                
                if (trimmedSearch) {
                    // Filtra si el título O el subtítulo incluyen el término de búsqueda
                    newsData = newsData.filter(newsItem => 
                        (newsItem.title && newsItem.title.toLowerCase().includes(trimmedSearch)) ||
                        (newsItem.subtitle && newsItem.subtitle.toLowerCase().includes(trimmedSearch))
                    );
                }

                const grouped = {};
                // Agrupamos o mostramos resultados de búsqueda
                if (selectedSection === 'Todas' && !trimmedSearch) { 
                    // Agrupa por sección (Vista por defecto)
                    sections.filter(s => s !== 'Todas').forEach(sec => {
                        grouped[sec] = newsData.filter(n => n.category === sec);
                    });
                } else if (newsData.length > 0) {
                    // Muestra una lista plana si hay sección seleccionada o búsqueda
                    const groupKey = trimmedSearch ? `Resultados para "${trimmedSearch}"` : selectedSection;
                    grouped[groupKey] = newsData;
                }

                setAllNews(grouped);
                setLoading(false);
            },
            (err) => {
                setError("Error al obtener noticias. Confirme el índice básico (status, category) o los datos.");
                setLoading(false);
                console.error("Error al obtener noticias:", err);
            }
        );

        return () => unsubscribe();
    }, [sections, selectedSection, debouncedSearchTerm]); // <-- DEPENDENCIA CLAVE

    // El onChange solo actualiza el estado inmediato 'searchTerm'
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (e.target.value) { 
            setSelectedSection('Todas'); // Desactiva el filtro de sección al buscar
        }
    };
    

    if (loading) {
        return <div className="homepage-container loading-message">Cargando noticias y secciones...</div>;
    }

    if (error) {
        return <div className="homepage-container error-message">{error}</div>;
    }

    return (
        <div className="homepage-container">
            <h1 className="portal-title">Portal de Noticias Corporativas</h1>
            
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Buscar por título o bajante de la publicación..."
                    // El input usa el estado inmediato (searchTerm) para una respuesta fluida
                    value={searchTerm} 
                    onChange={handleSearchChange}
                    className="search-input"
                />
            </div>

            <div className="filter-bar">
                {sections.map(section => (
                    <button
                        key={section}
                        onClick={() => {
                            setSelectedSection(section);
                            setSearchTerm(''); 
                        }}
                        // Clase activa si no hay búsqueda y la sección coincide
                        className={`filter-button ${selectedSection === section && !searchTerm ? 'active' : ''}`}
                        disabled={!!searchTerm} // Deshabilitar si se está buscando
                    >
                        {section}
                    </button>
                ))}
            </div>

            <div className="news-content">
                {Object.keys(allNews).map(sectionName => {
                    const newsInSection = allNews[sectionName];
                    
                    if (newsInSection.length === 0) {
                        return null; 
                    }

                    return (
                        <section key={sectionName} className="news-section">
                            <h2 className="section-title">{sectionName}</h2>
                            <div className="news-grid">
                                {newsInSection.map(newsItem => (
                                    // Usamos el componente NewsCard aquí
                                    <NewsCard key={newsItem.id} news={newsItem} /> 
                                ))}
                            </div>
                        </section>
                    );
                })}
                
                {Object.keys(allNews).length === 0 && (
                    <p className="no-results no-news-message">No hay resultados para la búsqueda actual.</p>
                )}
            </div>
        </div>
    );
}

export default HomePage;