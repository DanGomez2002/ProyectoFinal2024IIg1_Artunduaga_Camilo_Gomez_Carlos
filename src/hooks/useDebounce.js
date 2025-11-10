import { useState, useEffect } from 'react'; // <-- CORRECCIÓN: 'from' en lugar de '=>'

// Hook personalizado para introducir un retraso en la actualización de un valor
function useDebounce(value, delay) {
    // Estado para almacenar el valor con retraso
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Establece el temporizador (Timer)
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Limpieza: Cancela el temporizador si el valor cambia o si el componente se desmonta
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;