import { useState, useEffect } from 'react';
import sql from '../../../config/db';

export function useClients() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchClientes = async () => {
        try {
            setLoading(true);
            const data = await sql`
                SELECT * FROM customers
            `;
            setClientes(data);
        } catch (error) {
            console.error("Error en Neon:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    return { clientes, loading };
}