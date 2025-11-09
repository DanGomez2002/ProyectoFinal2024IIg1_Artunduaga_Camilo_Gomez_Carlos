// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, db } from '../firebase';
// 1. IMPORTAR 'doc' y 'getDoc'
import { doc, setDoc, getDoc } from 'firebase/firestore'; 

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // <-- 2. NUEVO ESTADO PARA EL ROL
  const [loading, setLoading] = useState(true);

  async function signup(email, password, role) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Guardamos el rol en Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: role 
    });
    // Guardamos el rol también en el estado local
    setUserRole(role); // <-- 3. GUARDAR ROL AL REGISTRARSE
    
    return userCredential;
  }

  function login(email, password) {
    // La función de login no necesita cambiar
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    setUserRole(null); // <-- 4. LIMPIAR ROL AL CERRAR SESIÓN
    return signOut(auth);
  }

  // 5. FUNCIÓN ACTUALIZADA (LA MÁS IMPORTANTE)
  // Ahora también busca el rol del usuario en la BD
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Si hay usuario, buscar su rol en Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserRole(userData.role); // Guardamos el rol
        } else {
          // Esto puede pasar si un usuario se borra de la BD pero no de Auth
          setUserRole(null);
        }
        setCurrentUser(user);
      } else {
        // No hay usuario
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 6. Valores que compartiremos
  const value = {
    currentUser,
    userRole, // <-- 7. COMPARTIR EL ROL CON LA APP
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