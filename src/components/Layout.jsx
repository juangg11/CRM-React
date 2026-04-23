import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Settings } from 'lucide-react';

const MENU_ITEMS = [
    { id: 'dash', label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { id: 'citas', label: 'Citas', path: '/citas', icon: Calendar },
    { id: 'clientes', label: 'Clientes', path: '/clientes', icon: Users },
];

export default function Layout({ children }) {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900">
            {/* SIDEBAR */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
                <nav className="flex-1 flex flex-col justify-center px-4 space-y-5">
                    {MENU_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Botón de configuración siempre abajo */}
                <div className="p-4 border-t border-gray-100">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 w-full px-4 py-2 text-sm">
                        <Settings size={16} /> Configuración
                    </button>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 overflow-y-auto">
                <div className="h-full p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}