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
                ORDER BY name ASC
            `;
            setClientes(data);
        } catch (error) {
            console.error('Error en Neon:', error);
        } finally {
            setLoading(false);
        }
    };

    const createCliente = async (cliente) => {
        await sql`
            INSERT INTO customers (name, email, phone)
            VALUES (${cliente.name}, ${cliente.email}, ${cliente.phone})
        `;
        await fetchClientes();
    };

    const updateCliente = async (id, cliente) => {
        await sql`
            UPDATE customers
            SET name  = ${cliente.name},
                email = ${cliente.email},
                phone = ${cliente.phone}
            WHERE id = ${id}
        `;
        await fetchClientes();
    };

    const deleteCliente = async (id) => {
        await sql`DELETE FROM customers WHERE id = ${id}`;
        await fetchClientes();
    };

    useEffect(() => { fetchClientes(); }, []);

    return { clientes, loading, createCliente, updateCliente, deleteCliente };
}