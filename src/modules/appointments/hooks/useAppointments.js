import { useState, useEffect } from 'react';
import sql from '../../../config/db';

export function useAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await sql`
        SELECT * FROM appointments 
        WHERE status != 'finalizada'
        ORDER BY appointment_date ASC, appointment_time ASC
      `;
            setAppointments(data);
        } catch (error) {
            console.error("Error en Neon:", error);
        } finally {
            setLoading(false);
        }
    };

    const createAppointment = async (newAppo) => {
        try {
            await sql`
        INSERT INTO appointments (customer_id, client_name, service, appointment_date, appointment_time)
        VALUES (${newAppo.customer_id || null}, ${newAppo.client_name}, ${newAppo.service}, ${newAppo.date}, ${newAppo.time})
      `;
            fetchAppointments();
        } catch (error) {
            console.error("Error al crear:", error);
        }
    };

    const finalizarCita = async (id, notas) => {
        try {
            await sql`
        UPDATE appointments 
        SET status = 'finalizada', notes = ${notas}
        WHERE id = ${id}
      `;
            fetchAppointments();
        } catch (error) {
            console.error("Error al finalizar:", error);
        }
    };

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
        fetchAppointments();
    }, []);

    return { appointments, loading, createAppointment, finalizarCita, sumVentas };
}