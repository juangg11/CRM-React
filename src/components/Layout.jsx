import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Settings, Scissors } from 'lucide-react';

const MENU_ITEMS = [
    { id: 'dash',     label: 'Dashboard', path: '/',         icon: LayoutDashboard },
    { id: 'citas',    label: 'Citas',     path: '/citas',    icon: Calendar },
    { id: 'clientes', label: 'Clientes',  path: '/clientes', icon: Users },
];

export default function Layout({ children }) {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden">
            {/* ── SIDEBAR ──────────────────────────────────── */}
            <aside className="w-60 bg-white border-r border-gray-100 flex flex-col h-screen flex-shrink-0 shadow-sm">

                {/* Logo / Branding */}
                <div className="px-5 py-6 flex items-center gap-3 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md">
                        <Scissors size={17} className="text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-sm leading-none">SalónCRM</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Panel de gestión</p>
                    </div>
                </div>

                {/* Navegación */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">Menú</p>
                    {MENU_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
                                    ${isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                            >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors
                                    ${isActive ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                                    <Icon size={15} />
                                </div>
                                {item.label}
                                {isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Pie sidebar */}
                <div className="p-3 border-t border-gray-100">
                    <button className="flex items-center gap-3 text-gray-500 hover:text-gray-800 w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors">
                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Settings size={15} />
                        </div>
                        Configuración
                    </button>
                </div>
            </aside>

            {/* ── CONTENIDO PRINCIPAL ──────────────────────── */}
            <main className="flex-1 overflow-y-auto">
                <div className="h-full p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}