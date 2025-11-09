// src/pages/CreateNewsPage/CreateNewsPage.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { storage, db } from '../../firebase'; // Importamos Storage y Firestore
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './CreateNewsPage.css';

function CreateNewsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Estados para los campos del formulario
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Tecnologia'); // Categoría por defecto
  const [imageFile, setImageFile] = useState(null); // Para el archivo de imagen

  // Estados de control
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Manejador para el archivo de imagen
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Por favor, selecciona una imagen para la noticia.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Subir la imagen a Firebase Storage
      const storageRef = ref(storage, `news-images/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const imageUrl = await getDownloadURL(storageRef);

      // 2. Guardar la noticia en Firestore
      const newsCollectionRef = collection(db, 'news');
      await addDoc(newsCollectionRef, {
        title,
        subtitle,
        content,
        category,
        imageUrl, // La URL de la imagen que subimos
        author: currentUser.uid, // Guardamos el ID del autor
        authorEmail: currentUser.email, // (Opcional) Guardamos el email
        status: 'Edición', // Estado inicial según la rúbrica
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setLoading(false);
      // 3. Redirigir al dashboard
      navigate('/dashboard');

    } catch (err) {
      setError('Error al crear la noticia: ' + err.message);
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <div className="create-news-container">
      <h2>Crear Nueva Noticia</h2>
      <form onSubmit={handleSubmit} className="create-news-form">
        
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="title">Título:</label>
          <input
            id="title" type="text" value={title}
            onChange={(e) => setTitle(e.target.value)} required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="subtitle">Subtítulo (Bajante):</label>
          <input
            id="subtitle" type="text" value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)} required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Categoría:</label>
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {/* Aquí puedes añadir las categorías que pide la rúbrica */}
            <option value="Tecnologia">Tecnología</option>
            <option value="Deportes">Deportes</option>
            <option value="Politica">Política</option>
            <option value="Cultura">Cultura</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">Imagen de Portada:</label>
          <input
            id="image" type="file"
            onChange={handleImageChange} required
            accept="image/*" // Solo aceptar imágenes
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Contenido:</label>
          <textarea
            id="content" value={content}
            onChange={(e) => setContent(e.target.value)} required
            rows="10"
          ></textarea>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Noticia (en Edición)'}
        </button>
      </form>
    </div>
  );
}

export default CreateNewsPage;