import React from 'react';
import { useClients } from '../hooks/useClients';
import { Calendar, Plus } from 'lucide-react';

export default function AppointmentsPage() {
    const { clientes, loading } = useClients();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">Clientes</h2>
                </div>
            </div>

            <div className="p-6">
                {loading ? (
                    <p className="text-gray-500 italic">Cargando datos...</p>
                ) : clientes.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-400">No hay clientes registrados aún.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {clientes.map((cliente) => (
                            <li key={cliente.id} className="py-4 flex justify-between">
                                <div>
                                    <p className="font-semibold text-gray-800">{cliente.name}</p>
                                    <p className="text-sm text-gray-500">{cliente.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">{cliente.phone}</p>
                                    <p className="text-xs text-gray-400">{cliente.address}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}