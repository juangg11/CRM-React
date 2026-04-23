import { useState, useEffect } from 'react';
import sql from '../../../config/db';

export function useDashboard() {
    const [ventas, setVentas] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchVentas = async () => {
        try {
            setLoading(true);
            const data = await sql`
                SELECT * FROM ventas
                ORDER BY id_mes ASC
            `;
            setVentas(data);
        } catch (error) {
            console.error("Error en Neon:", error);
        } finally {
            setLoading(false);
        }
    };

    const datos = ventas.map((fila) => ({
        name: fila.mes,
        ventas: fila.total,
    }));

    const sumVentas = async (cantidad) => {
        const mesActual = new Date().getMonth() + 1; // porque getMonth() devuelve 0-11

        try {
            await sql`
                UPDATE ventas
                SET total = total + ${cantidad}
                WHERE id_mes = ${mesActual}
            `;
            await fetchVentas();
        } catch (error) {
            console.error("Error al sumar venta:", error);
        }
    };

    useEffect(() => {
        fetchVentas();
    }, []);

    return { ventas, datos, loading, sumVentas };
}