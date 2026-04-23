import React, { useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useDashboard }    from '../hooks/useDashboard';
import { useAppointments } from '../hooks/useAppointments';
import { useClients }      from '../hooks/useClients';
import { useSettings }     from '../../../context/SettingsContext';
import {
    TrendingUp, Calendar, Users, DollarSign,
    Clock, ArrowUpRight, ArrowDownRight, Star
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────
const MONTHS_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
function isoDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '' : dt.toISOString().split('T')[0];
}

// ─── KPI Card ─────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color, trend, delay = 0 }) {
    const palettes = {
        green:  { bg: '#f0fdf4', icon: '#bbf7d0', txt: '#15803d' },
        blue:   { bg: 'var(--primary-light)', icon: 'var(--primary-medium)', txt: 'var(--primary)' },
        purple: { bg: '#f5f3ff', icon: '#ddd6fe', txt: '#7c3aed' },
        amber:  { bg: '#fffbeb', icon: '#fde68a', txt: '#d97706' },
    };
    const p  = palettes[color] ?? palettes.blue;
    const up = trend > 0;

    return (
        <div className="card-base card-float p-5 flex flex-col gap-3 animate-fade-up"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', animationDelay: `${delay}s` }}>
            <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: p.icon }}>
                    <Icon size={19} style={{ color: p.txt }} />
                </div>
                {trend !== undefined && (
                    <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-green-600' : 'text-red-500'}`}>
                        {up ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>{value}</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-2)' }}>{label}</p>
                {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{sub}</p>}
            </div>
        </div>
    );
}

// ─── Tooltip chart ────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl px-4 py-2.5 text-sm shadow-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="font-semibold mb-1" style={{ color: 'var(--text-2)' }}>{label}</p>
            <p className="font-bold" style={{ color: 'var(--primary)' }}>
                {Number(payload[0].value).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </p>
        </div>
    );
}

// ─── Próximas citas ───────────────────────────────────────────────────────
function ProximasCitas({ appointments }) {
    const today = isoDate(new Date());
    const list = useMemo(() =>
        appointments.filter(a => isoDate(a.appointment_date) >= today).slice(0, 5),
        [appointments, today]
    );
    if (!list.length) return (
        <div className="flex flex-col items-center justify-center py-10 gap-2" style={{ color: 'var(--text-3)' }}>
            <Calendar size={32} style={{ opacity: 0.3 }} />
            <p className="text-sm">Sin citas próximas</p>
        </div>
    );
    return (
        <ul className="space-y-1">
            {list.map((cita, i) => {
                const d = new Date(cita.appointment_date);
                return (
                    <li key={cita.id}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors animate-fade-up stagger-${i + 1}`}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                            style={{ background: 'var(--primary-light)' }}>
                            <span className="text-xs font-bold leading-none" style={{ color: 'var(--primary)' }}>
                                {isNaN(d.getTime()) ? '?' : d.getDate()}
                            </span>
                            <span className="text-[9px] font-semibold uppercase leading-none mt-0.5" style={{ color: 'var(--primary)' }}>
                                {isNaN(d.getTime()) ? '' : MONTHS_ES[d.getMonth()]}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-1)' }}>{cita.client_name}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{cita.service}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color: 'var(--text-3)' }}>
                            <Clock size={11} />{cita.appointment_time?.slice(0, 5)}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

// ─── Clientes recientes ───────────────────────────────────────────────────
const AV_COLORS = [
    'bg-blue-100 text-blue-700','bg-purple-100 text-purple-700',
    'bg-green-100 text-green-700','bg-amber-100 text-amber-700','bg-rose-100 text-rose-700',
];
function ClientesRecientes({ clientes }) {
    if (!clientes.length) return (
        <div className="flex flex-col items-center justify-center py-10 gap-2" style={{ color: 'var(--text-3)' }}>
            <Users size={32} style={{ opacity: 0.3 }} /><p className="text-sm">Sin clientes</p>
        </div>
    );
    const ini = (n='') => n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'?';
    return (
        <ul className="space-y-1">
            {clientes.slice(0,5).map((c,i)=>(
                <li key={c.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors animate-fade-up stagger-${i+1}`}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${AV_COLORS[i%AV_COLORS.length]}`}>
                        {ini(c.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-1)' }}>{c.name}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{c.email||c.phone||'—'}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}

// ─── Panel card wrapper ───────────────────────────────────────────────────
function Panel({ title, sub, icon: Icon, children, span = '', delay = 0 }) {
    return (
        <div className={`card-base p-5 flex flex-col animate-fade-up ${span}`}
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', animationDelay: `${delay}s` }}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="font-bold text-base" style={{ color: 'var(--text-1)' }}>{title}</h2>
                    {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{sub}</p>}
                </div>
                <Icon size={16} style={{ color: 'var(--text-3)' }} />
            </div>
            {children}
        </div>
    );
}

// ─── Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const { settings } = useSettings();
    const { datos, ventas, loading: lv } = useDashboard();
    const { appointments, loading: la }  = useAppointments();
    const { clientes, loading: lc }      = useClients();

    const totalVentas  = useMemo(()=>ventas.reduce((s,v)=>s+Number(v.total??0),0),[ventas]);
    const mesIdx       = new Date().getMonth();
    const ventasMes    = useMemo(()=>Number(ventas[mesIdx]?.total??0),[ventas,mesIdx]);
    const ventasMesAnt = useMemo(()=>Number(ventas[mesIdx-1]?.total??0),[ventas,mesIdx]);
    const trend        = ventasMesAnt>0 ? Math.round(((ventasMes-ventasMesAnt)/ventasMesAnt)*100) : undefined;
    const today        = isoDate(new Date());
    const citasHoy     = useMemo(()=>appointments.filter(a=>isoDate(a.appointment_date)===today).length,[appointments,today]);
    const citasPend    = appointments.length;
    const cur          = settings.currency || '€';

    const chartData = datos.map(d=>({...d, ventas: Number(d.ventas)}));

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="animate-fade-up">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>Dashboard</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
                    {new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={DollarSign} label="Ventas este mes" value={`${ventasMes.toLocaleString('es-ES')} ${cur}`} color="green" trend={trend} delay={0.00} />
                <KpiCard icon={TrendingUp}  label="Ventas anuales"  value={`${totalVentas.toLocaleString('es-ES')} ${cur}`} color="blue"  delay={0.05} />
                <KpiCard icon={Calendar}    label="Citas hoy"       value={citasHoy}   color="purple" delay={0.10} />
                <KpiCard icon={Users}       label="Clientes"        value={clientes.length} sub={`${citasPend} citas pendientes`} color="amber" delay={0.15} />
            </div>

            {/* Chart + Próximas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Panel title="Ventas por mes" sub="Evolución anual de ingresos" icon={TrendingUp} span="lg:col-span-2" delay={0.18}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                            {new Date().getFullYear()}
                        </span>
                    </div>
                    {lv ? (
                        <div className="flex items-center justify-center h-52">
                            <div className="w-6 h-6 border-2 border-t-transparent rounded-full spin" style={{ borderColor: 'var(--primary)' }} />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={210}>
                            <AreaChart data={chartData} margin={{top:5,right:5,left:-10,bottom:0}}>
                                <defs>
                                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.18}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                                <XAxis dataKey="name" tick={{fontSize:11, fill:'var(--text-3)'}} axisLine={false} tickLine={false}/>
                                <YAxis tick={{fontSize:11, fill:'var(--text-3)'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}${cur}`}/>
                                <Tooltip content={<CustomTooltip/>}/>
                                <Area type="monotone" dataKey="ventas" stroke="var(--primary)" strokeWidth={2.5}
                                    fill="url(#grad)" dot={{r:3, fill:'var(--primary)', strokeWidth:0}}
                                    activeDot={{r:5, fill:'var(--primary-hover)'}}/>
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </Panel>

                <Panel title="Próximas citas" sub="Las más cercanas" icon={Calendar} delay={0.22}>
                    {la
                        ? <div className="flex items-center justify-center flex-1 py-10"><div className="w-5 h-5 border-2 border-t-transparent rounded-full spin" style={{ borderColor: 'var(--primary)' }}/></div>
                        : <ProximasCitas appointments={appointments}/>}
                </Panel>
            </div>

            {/* Clientes recientes */}
            <Panel title="Clientes recientes" sub={`${clientes.length} clientes en total`} icon={Star} delay={0.26}>
                {lc
                    ? <div className="flex items-center justify-center py-8"><div className="w-5 h-5 border-2 border-t-transparent rounded-full spin" style={{ borderColor: 'var(--primary)' }}/></div>
                    : <ClientesRecientes clientes={clientes}/>}
            </Panel>
        </div>
    );
}