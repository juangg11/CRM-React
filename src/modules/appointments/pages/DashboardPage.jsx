import React, { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area, CartesianGrid
} from 'recharts';
import { useDashboard } from '../hooks/useDashboard';
import { useAppointments } from '../hooks/useAppointments';
import { useClients } from '../hooks/useClients';
import {
    TrendingUp, Calendar, Users, DollarSign,
    Clock, ArrowUpRight, ArrowDownRight, Star
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isoDate(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
}

const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, color, trend }) {
    const colors = {
        blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', val: 'text-blue-700' },
        green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', val: 'text-green-700' },
        purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', val: 'text-purple-700' },
        amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', val: 'text-amber-700' },
    };
    const c = colors[color] ?? colors.blue;
    const trendUp = trend > 0;

    return (
        <div className={`${c.bg} rounded-2xl p-5 flex flex-col gap-3 border border-white shadow-sm`}>
            <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
                    <Icon size={20} />
                </div>
                {trend !== undefined && (
                    <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
                        {trendUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm font-medium text-gray-500 mt-0.5">{label}</p>
                {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
            </div>
        </div>
    );
}

// ─── Tooltip personalizado ────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-2.5 text-sm">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            <p className="text-blue-600 font-bold">{payload[0].value?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
        </div>
    );
}

// ─── Próximas citas ───────────────────────────────────────────────────────────

function ProximasCitas({ appointments }) {
    const today = isoDate(new Date());
    const proximas = useMemo(() =>
        appointments
            .filter(a => isoDate(a.appointment_date) >= today)
            .slice(0, 5),
        [appointments, today]
    );

    if (!proximas.length) return (
        <div className="flex flex-col items-center justify-center py-10 text-gray-300">
            <Calendar size={32} className="mb-2" />
            <p className="text-sm">Sin citas próximas</p>
        </div>
    );

    return (
        <ul className="space-y-2">
            {proximas.map(cita => {
                const d = new Date(cita.appointment_date);
                const dayNum = isNaN(d.getTime()) ? '?' : d.getDate();
                const monthAb = isNaN(d.getTime()) ? '' : MONTHS_ES[d.getMonth()];
                return (
                    <li key={cita.id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-blue-700 leading-none">{dayNum}</span>
                            <span className="text-[9px] font-semibold text-blue-400 uppercase leading-none">{monthAb}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{cita.client_name}</p>
                            <p className="text-xs text-gray-400 truncate">{cita.service}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                            <Clock size={11} />
                            {cita.appointment_time?.slice(0, 5)}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

// ─── Clientes recientes ───────────────────────────────────────────────────────

function ClientesRecientes({ clientes }) {
    const recientes = clientes.slice(0, 5);
    if (!recientes.length) return (
        <div className="flex flex-col items-center justify-center py-10 text-gray-300">
            <Users size={32} className="mb-2" />
            <p className="text-sm">Sin clientes</p>
        </div>
    );

    const initials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const avatarColors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700',
        'bg-green-100 text-green-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700'];

    return (
        <ul className="space-y-2">
            {recientes.map((c, i) => (
                <li key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                        {initials(c.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{c.name}</p>
                        <p className="text-xs text-gray-400 truncate">{c.email || c.phone || '—'}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

// ─── Dashboard principal ──────────────────────────────────────────────────────

export default function DashboardPage() {
    const { datos, ventas, loading: loadingV } = useDashboard();
    const { appointments, loading: loadingA } = useAppointments();
    const { clientes, loading: loadingC } = useClients();

    // KPIs derivados
    const totalVentas = useMemo(() => ventas.reduce((s, v) => s + Number(v.total ?? 0), 0), [ventas]);
    const mesActual = new Date().getMonth(); // 0-indexed
    const ventasMes = useMemo(() => Number(ventas[mesActual]?.total ?? 0), [ventas, mesActual]);
    const ventasMesAnt = useMemo(() => Number(ventas[mesActual - 1]?.total ?? 0), [ventas, mesActual]);
    const trendVentas = ventasMesAnt > 0 ? Math.round(((ventasMes - ventasMesAnt) / ventasMesAnt) * 100) : undefined;

    const today = isoDate(new Date());
    const citasHoy = useMemo(() => appointments.filter(a => isoDate(a.appointment_date) === today).length, [appointments, today]);
    const citasPend = appointments.length;

    const loading = loadingV || loadingA || loadingC;

    // Formatear datos del gráfico para mostrar símbolo €
    const chartData = datos.map(d => ({ ...d, ventas: Number(d.ventas) }));

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    icon={DollarSign}
                    label="Ventas este mes"
                    value={`${ventasMes.toLocaleString('es-ES')} €`}
                    color="green"
                    trend={trendVentas}
                />
                <KpiCard
                    icon={TrendingUp}
                    label="Ventas anuales"
                    value={`${totalVentas.toLocaleString('es-ES')} €`}
                    color="blue"
                />
                <KpiCard
                    icon={Calendar}
                    label="Citas hoy"
                    value={citasHoy}
                    color="purple"
                />
                <KpiCard
                    icon={Users}
                    label="Clientes"
                    value={clientes.length}
                    sub={`${citasPend} citas pendientes`}
                    color="amber"
                />
            </div>

            {/* Gráfico + Próximas citas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Gráfico de ventas */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="font-bold text-gray-900 text-base">Ventas por mes</h2>
                            <p className="text-xs text-gray-400">Evolución de ingresos anuales</p>
                        </div>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                            {new Date().getFullYear()}
                        </span>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center h-56">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="ventasGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                                    tickFormatter={v => `${v}€`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={2.5}
                                    fill="url(#ventasGrad)" dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
                                    activeDot={{ r: 5, fill: '#2563eb' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Próximas citas */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="font-bold text-gray-900 text-base">Próximas citas</h2>
                            <p className="text-xs text-gray-400">Las más cercanas</p>
                        </div>
                        <Calendar size={16} className="text-gray-300" />
                    </div>
                    {loadingA ? (
                        <div className="flex items-center justify-center flex-1">
                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <ProximasCitas appointments={appointments} />
                    )}
                </div>
            </div>

            {/* Clientes recientes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="font-bold text-gray-900 text-base">Clientes recientes</h2>
                        <p className="text-xs text-gray-400">{clientes.length} clientes en total</p>
                    </div>
                    <Star size={16} className="text-gray-300" />
                </div>
                {loadingC ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <ClientesRecientes clientes={clientes} />
                )}
            </div>
        </div>
    );
}