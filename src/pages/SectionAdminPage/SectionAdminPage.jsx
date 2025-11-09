import { useState, useEffect } from "react";
import { db } from "../../firebase"; // Importación limpia
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import "./SectionAdminPage.css"; // <-- Estilos específicos
import "../CreateNewsPage/CreateNewsPage.css"; // <-- Estilos base de formulario

function SectionAdminPage() {
  const [sections, setSections] = useState([]);
  const [newSectionName, setNewSectionName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. Cargar y escuchar secciones en tiempo real (R)
  useEffect(() => {
    const sectionsColRef = collection(db, "sections");

    // onSnapshot es clave para la actualización en tiempo real
    const unsubscribe = onSnapshot(
      sectionsColRef,
      (snapshot) => {
        const sectionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setSections(sectionsData);
        setLoading(false);
      },
      (err) => {
        setError("Error al cargar secciones: " + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe(); // Limpiar el listener
  }, []);

  // 2. Crear nueva sección (C)
  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    try {
      const sectionsColRef = collection(db, "sections");
      await addDoc(sectionsColRef, {
        name: newSectionName.trim(),
      });
      setNewSectionName("");
    } catch (err) {
      setError("Error al añadir la sección: " + err.message);
    }
  };

  // 3. Eliminar sección (D)
  const handleDeleteSection = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta sección?")) return;

    try {
      const docRef = doc(db, "sections", id);
      await deleteDoc(docRef);
    } catch (err) {
      setError("Error al eliminar la sección: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="form-page-container">
        <div className="loading-message">
          Cargando administrador de secciones...
        </div>
      </div>
    );
  }

  return (
    <div className="form-page-container">
      {" "}
      {/* <-- CLASE GLOBAL DE PÁGINA */}
      <div className="form-card">
        {" "}
        {/* <-- CLASE DE TARJETA/CONTENEDOR */}
        <h2>Administración de Secciones</h2>
        {error && <p className="error-message">{error}</p>}
        {/* Formulario de Creación */}
        <form onSubmit={handleAddSection} className="add-section-form">
          <input
            type="text"
            placeholder="Nombre de la nueva sección"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            required
            className="form-input"
          />
          <button type="submit">Agregar Sección</button>
        </form>
        {/* Lista de Secciones */}
        <ul className="sections-list">
          {sections.map((section) => (
            <li key={section.id} className="section-item">
              <span>{section.name}</span>
              <button
                onClick={() => handleDeleteSection(section.id)}
                className="delete-section-button"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
        {sections.length === 0 && <p>Aún no hay secciones creadas.</p>}
      </div>
    </div>
  );
}

export default SectionAdminPage;
