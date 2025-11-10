import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, db } from '../firebase.js'; // Asegúrate que la extensión .js esté
import { doc, setDoc, getDoc } from 'firebase/firestore'; 

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null); // Estado para el nombre
  const [loading, setLoading] = useState(true); // <-- Este estado es clave

  // Firma actualizada (añadido 'name')
  async function signup(email, password, role, name) { 
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user; 
    
    // Guardamos el rol Y EL NOMBRE en Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: role,
      name: name // Campo de nombre
    }); 
    
    // Actualizamos el estado local
    setUserRole(role);
    setUserName(name); 
    return userCredential;
  } 

  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user; 
    
    // Fuerza la carga del rol y nombre
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserRole(userData.role);
          setUserName(userData.name); // Carga el nombre
        }
      } catch (error) {
        console.error("Error al forzar la carga del rol en login:", error);
      }
    }
    return userCredential;
  }

  function logout() {
    setUserRole(null);
    setUserName(null); // Limpia el nombre
    return signOut(auth);
  } 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserRole(userData.role); 
          setUserName(userData.name); // Carga el nombre
        } else {
          setUserRole(null);
          setUserName(null); 
        }
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserName(null); 
      }
      setLoading(false); // <-- Setea loading a false cuando termina
    });

    return unsubscribe;
  }, []); 

  const value = {
    currentUser,
    userRole,
    userName,
    loading, // <-- CAMBIO CLAVE: Exportamos el estado de carga
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}