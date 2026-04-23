import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Settings, Scissors } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const MENU_ITEMS = [
    { id: 'dash',     label: 'Dashboard', path: '/',         icon: LayoutDashboard },
    { id: 'citas',    label: 'Citas',     path: '/citas',    icon: Calendar },
    { id: 'clientes', label: 'Clientes',  path: '/clientes', icon: Users },
];

export default function Layout({ children }) {
    const location  = useLocation();
    const { settings } = useSettings();

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-app)' }}>

            {/* ── SIDEBAR ─────────────────────────────── */}
            <aside className="sidebar-base w-60 flex flex-col h-screen flex-shrink-0 animate-slide-left">

                {/* Branding */}
                <div className="px-5 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, var(--primary), var(--primary-hover))` }}
                    >
                        <Scissors size={17} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-sm leading-none truncate" style={{ color: 'var(--text-1)' }}>
                            {settings.businessName || 'SalónCRM'}
                        </p>
                        <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>
                            {settings.businessTagline || 'Panel de gestión'}
                        </p>
                    </div>
                </div>

                {/* Navegación */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2" style={{ color: 'var(--text-3)' }}>
                        Menú
                    </p>
                    {MENU_ITEMS.map((item, i) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`animate-fade-up stagger-${i + 1} flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group`}
                                style={isActive
                                    ? { background: 'var(--primary-light)', color: 'var(--primary)' }
                                    : { color: 'var(--text-2)' }
                                }
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = ''; }}
                            >
                                <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                                    style={isActive
                                        ? { background: 'var(--primary-medium)' }
                                        : { background: 'var(--bg-hover)' }
                                    }
                                >
                                    <Icon size={15} />
                                </div>
                                {item.label}
                                {isActive && (
                                    <span
                                        className="ml-auto w-1.5 h-1.5 rounded-full pulse-dot"
                                        style={{ background: 'var(--primary)' }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Configuración */}
                <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <Link
                        to="/configuracion"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium"
                        style={location.pathname === '/configuracion'
                            ? { background: 'var(--primary-light)', color: 'var(--primary)' }
                            : { color: 'var(--text-2)' }
                        }
                        onMouseEnter={e => { if (location.pathname !== '/configuracion') e.currentTarget.style.background = 'var(--bg-hover)'; }}
                        onMouseLeave={e => { if (location.pathname !== '/configuracion') e.currentTarget.style.background = ''; }}
                    >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-hover)' }}>
                            <Settings size={15} />
                        </div>
                        Configuración
                    </Link>
                </div>
            </aside>

            {/* ── CONTENIDO ───────────────────────────── */}
            <main className="flex-1 overflow-y-auto">
                <div className="h-full p-6 animate-fade-up">
                    {children}
                </div>
            </main>
        </div>
    );
}