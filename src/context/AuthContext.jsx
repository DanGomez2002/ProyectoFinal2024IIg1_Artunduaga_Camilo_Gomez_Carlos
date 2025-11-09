import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "../firebase";
// Importar 'doc' y 'getDoc' de Firestore
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, role) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user; // Guardamos el rol en Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: role,
    }); // Actualizamos el estado local
    setUserRole(role);
    return userCredential;
  } // CORRECCIÓN CLAVE: Función login espera la carga del rol

  async function login(email, password) {
    // 1. Inicia sesión en Auth
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user; // 2. Fuerza la carga del rol desde Firestore (resuelve la condición de carrera)

    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          // Si encontramos el rol, lo seteamos para asegurar
          setUserRole(docSnap.data().role);
        }
      } catch (error) {
        console.error("Error al forzar la carga del rol en login:", error);
      }
    }
    return userCredential;
  }

  function logout() {
    setUserRole(null);
    return signOut(auth);
  } // Función de escucha de cambios de autenticación

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
  }, []); // Valores que compartiremos

  const value = {
    currentUser,
    userRole,
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
