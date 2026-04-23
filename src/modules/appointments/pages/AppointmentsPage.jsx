import React, { useState, useMemo } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import NuevaCitaModal from '../components/NuevaCitaModal';
import {
    Plus, X, ChevronLeft, ChevronRight,
    Calendar, LayoutGrid, Clock, User, Scissors
} from 'lucide-react';

// ─── Helpers de fecha ─────────────────────────────────────────────────────────

const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function isoDate(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
}

function startOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0=dom
    const diff = day === 0 ? -6 : 1 - day; // lunes
    d.setDate(d.getDate() + diff);
    return d;
}

function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

// ─── Modal finalizar ──────────────────────────────────────────────────────────

function FinalizarModal({ cita, onClose, onConfirmar }) {
    const [dinero, setDinero] = useState('');
    const [notas, setNotas] = useState('');
    const [guardando, setGuardando] = useState(false);

    const handleConfirmar = async () => {
        if (!dinero) return;
        setGuardando(true);
        await onConfirmar({ cita, dinero: parseFloat(dinero), notas });
        setGuardando(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="relative rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in" style={{ background: 'var(--bg-card)' }}>
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>Finalizar cita</h2>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>{cita.client_name} · {cita.service}</p>
                    </div>
                    <button onClick={onClose} className="p-1 transition-colors rounded-lg btn-press" style={{ color: 'var(--text-3)' }}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                        onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <X size={20} />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-3)' }}>
                            Importe cobrado <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium" style={{ color: 'var(--text-3)' }}>€</span>
                            <input
                                type="number" min="0" step="0.01" placeholder="0.00"
                                value={dinero} onChange={(e) => setDinero(e.target.value)} autoFocus
                                className="input-base theme-ring w-full pl-8 pr-4 py-2.5 rounded-xl text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-3)' }}>Notas (opcional)</label>
                        <textarea rows={3} placeholder="Observaciones de la cita…"
                            value={notas} onChange={(e) => setNotas(e.target.value)}
                            className="input-base theme-ring w-full px-3 py-2.5 rounded-xl text-sm resize-none"
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold btn-press transition-colors"
                        style={{ borderColor: 'var(--border-in)', color: 'var(--text-2)' }}>
                        Cancelar
                    </button>
                    <button onClick={handleConfirmar} disabled={!dinero || guardando}
                        className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 btn-press transition-colors"
                        style={{ background: 'var(--primary)' }}
                        onMouseEnter={e=>{ if(!guardando) e.currentTarget.style.background='var(--primary-hover)'; }}
                        onMouseLeave={e=>e.currentTarget.style.background='var(--primary)'}>
                        {guardando ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spin"/> : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Chip de cita (en celda del calendario) ───────────────────────────────────

function CitaChip({ cita }) {
    return (
        <div className="text-[10px] leading-tight rounded px-1 py-0.5 truncate font-medium text-center"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            {cita.appointment_time?.slice(0, 5)} {cita.client_name}
        </div>
    );
}

// ─── Panel lateral: citas del día / semana seleccionado ───────────────────────

function CitasPanel({ citas, titulo, onFinalizar }) {
    if (!citas.length) return (
        <div className="flex flex-col items-center justify-center h-40 animate-fade-in" style={{ color: 'var(--text-3)' }}>
            <Calendar size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Sin citas este día</p>
        </div>
    );

    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-3)' }}>{titulo}</p>
            {citas.map((cita, i) => (
                <div key={cita.id}
                    className={`group flex items-start gap-3 p-3 rounded-xl border transition-all animate-fade-up stagger-${i+1}`}
                    style={{ borderColor: 'var(--border)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-medium)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
                        <User size={14} style={{ color: 'var(--primary)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-1)' }}>{cita.client_name}</p>
                        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-2)' }}>{cita.service}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: 'var(--text-3)' }}>
                            <Clock size={10} />
                            {cita.appointment_time?.slice(0, 5)}
                            <span className="mx-1">·</span>
                            {new Date(cita.appointment_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </div>
                    </div>
                    <button
                        onClick={() => onFinalizar(cita)}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-white text-xs px-2 py-1.5 rounded-lg transition-all font-semibold btn-press"
                        style={{ background: '#10b981' }} // emerald-500
                        onMouseEnter={e=>e.currentTarget.style.background='#059669'} // emerald-600
                        onMouseLeave={e=>e.currentTarget.style.background='#10b981'}>
                        Finalizar
                    </button>
                </div>
            ))}
        </div>
    );
}

// ─── Vista Mes ────────────────────────────────────────────────────────────────

function MonthView({ year, month, appointments, selectedDay, onSelectDay }) {
    const today = new Date();

    // Primer día del mes y cuántos días tiene
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Offset: lunes=0
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    // Mapa fecha→citas para el mes
    const citasByDay = useMemo(() => {
        const map = {};
        appointments.forEach((c) => {
            const key = isoDate(c.appointment_date);
            if (!map[key]) map[key] = [];
            map[key].push(c);
        });
        return map;
    }, [appointments]);

    const cells = [];
    // Celdas vacías iniciales
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div className="animate-fade-in">
            {/* Cabecera días */}
            <div className="grid grid-cols-7 mb-1">
                {DAYS_ES.map((d) => (
                    <div key={d} className="text-center text-xs font-semibold py-2" style={{ color: 'var(--text-3)' }}>{d}</div>
                ))}
            </div>
            {/* Celdas */}
            <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} />;
                    const dateObj = new Date(year, month, day);
                    const key = isoDate(dateObj);
                    const dayCitas = citasByDay[key] ?? [];
                    const isToday = sameDay(dateObj, today);
                    const isSelected = selectedDay && sameDay(dateObj, selectedDay);

                    return (
                        <button key={key} onClick={() => onSelectDay(dateObj)}
                            className="relative flex flex-col min-h-[80px] p-1.5 rounded-xl border text-left transition-all"
                            style={{
                                borderColor: isSelected ? 'var(--primary-medium)' : 'var(--border)',
                                background: isSelected ? 'var(--primary-light)' : (isToday ? 'var(--bg-hover)' : 'transparent')
                            }}
                            onMouseEnter={e => { if(!isSelected) { e.currentTarget.style.borderColor = 'var(--primary-ring)'; e.currentTarget.style.background = 'var(--bg-hover)'; } }}
                            onMouseLeave={e => { if(!isSelected) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = isToday ? 'var(--bg-hover)' : 'transparent'; } }}>
                            <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1`}
                                style={{
                                    background: isToday ? 'var(--primary)' : 'transparent',
                                    color: isToday ? 'white' : 'var(--text-1)'
                                }}>
                                {day}
                            </span>
                            <div className="flex-1 flex flex-col justify-center space-y-0.5 w-full overflow-hidden pb-1">
                                {dayCitas.slice(0, 2).map((c) => (
                                    <CitaChip key={c.id} cita={c} />
                                ))}
                                {dayCitas.length > 2 && (
                                    <div className="text-[10px] font-medium pl-1 text-center" style={{ color: 'var(--text-3)' }}>
                                        +{dayCitas.length - 2} más
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Vista Semana ─────────────────────────────────────────────────────────────

function WeekView({ weekStart, appointments, selectedDay, onSelectDay }) {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
    });

    const citasByDay = useMemo(() => {
        const map = {};
        appointments.forEach((c) => {
            const key = isoDate(c.appointment_date);
            if (!map[key]) map[key] = [];
            map[key].push(c);
        });
        return map;
    }, [appointments]);

    return (
        <div className="grid grid-cols-7 gap-1 animate-fade-in">
            {days.map((dateObj) => {
                const key = isoDate(dateObj);
                const dayCitas = citasByDay[key] ?? [];
                const isToday = sameDay(dateObj, today);
                const isSelected = selectedDay && sameDay(dateObj, selectedDay);

                return (
                    <button key={key} onClick={() => onSelectDay(dateObj)}
                        className="flex flex-col min-h-[140px] p-2 rounded-xl border text-left transition-all"
                        style={{
                            borderColor: isSelected ? 'var(--primary-medium)' : 'var(--border)',
                            background: isSelected ? 'var(--primary-light)' : (isToday ? 'var(--bg-hover)' : 'transparent')
                        }}
                        onMouseEnter={e => { if(!isSelected) { e.currentTarget.style.borderColor = 'var(--primary-ring)'; e.currentTarget.style.background = 'var(--bg-hover)'; } }}
                        onMouseLeave={e => { if(!isSelected) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = isToday ? 'var(--bg-hover)' : 'transparent'; } }}>
                        {/* Header día */}
                        <div className="flex flex-col items-center mb-2">
                            <span className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-3)' }}>
                                {DAYS_ES[(dateObj.getDay() + 6) % 7]}
                            </span>
                            <span className="text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mt-0.5"
                                style={{
                                    background: isToday ? 'var(--primary)' : 'transparent',
                                    color: isToday ? 'white' : 'var(--text-1)'
                                }}>
                                {dateObj.getDate()}
                            </span>
                        </div>
                        {/* Citas */}
                        <div className="flex-1 flex flex-col justify-center space-y-1 w-full pb-2">
                            {dayCitas.map((c) => (
                                <div key={c.id} className="rounded-lg px-1.5 py-1 text-center" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                    <p className="text-[10px] font-bold leading-tight">{c.appointment_time?.slice(0, 5)}</p>
                                    <p className="text-[10px] leading-tight truncate">{c.client_name}</p>
                                </div>
                            ))}
                            {!dayCitas.length && (
                                <p className="text-[10px] text-center pt-2" style={{ color: 'var(--text-3)' }}>—</p>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AppointmentsPage() {
    const { appointments, loading, createAppointment, finalizarCita, sumVentas } = useAppointments();
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);
    const [mostrarNuevaCita, setMostrarNuevaCita] = useState(false);

    // Navegación calendario
    const today = new Date();
    const [viewMode, setViewMode] = useState('month'); // 'month' | 'week'
    const [currentDate, setCurrentDate] = useState(today); // referencia del mes/semana actual
    const [selectedDay, setSelectedDay] = useState(today);

    // Derivados
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const weekStart = startOfWeek(currentDate);

    // Citas del día seleccionado
    const citasDelDia = useMemo(() => {
        if (!selectedDay) return [];
        const key = isoDate(selectedDay);
        return appointments.filter((c) => isoDate(c.appointment_date) === key);
    }, [selectedDay, appointments]);

    // Citas de la semana (para el panel lateral en vista semana)
    const citasDeSemana = useMemo(() => {
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            return isoDate(d);
        });
        return appointments.filter((c) => {
            const k = isoDate(c.appointment_date);
            return days.includes(k);
        }).sort((a, b) => {
            const da = isoDate(a.appointment_date) + (a.appointment_time || '');
            const db = isoDate(b.appointment_date) + (b.appointment_time || '');
            return da.localeCompare(db);
        });
    }, [weekStart, appointments]);

    // Navegación mes
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Navegación semana
    const prevWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 7);
        setCurrentDate(d);
    };
    const nextWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 7);
        setCurrentDate(d);
    };

    const handleSelectDay = (date) => {
        setSelectedDay(date);
        // En vista semana, sincronizar currentDate
        if (viewMode === 'week') setCurrentDate(date);
    };

    const handleConfirmar = async ({ cita, dinero, notas }) => {
        await sumVentas(dinero);
        await finalizarCita(cita.id, notas);
    };

    // Título del header
    const headerTitle = viewMode === 'month'
        ? `${MONTHS_ES[month]} ${year}`
        : (() => {
            const ws = startOfWeek(currentDate);
            const we = new Date(ws); we.setDate(ws.getDate() + 6);
            return `${ws.getDate()} – ${we.getDate()} ${MONTHS_ES[we.getMonth()]} ${we.getFullYear()}`;
        })();

    const panelCitas = viewMode === 'month' ? citasDelDia : citasDeSemana;
    const panelTitulo = viewMode === 'month'
        ? selectedDay?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
        : 'Citas de la semana';

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-5 h-full">
                {/* ── Calendario ─────────────────────────────────── */}
                <div className="flex-1 rounded-2xl shadow-sm border overflow-hidden flex flex-col animate-fade-up card-base"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>

                    {/* Header */}
                    <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b" style={{ borderColor: 'var(--border)' }}>
                        {/* Navegación */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={viewMode === 'month' ? prevMonth : prevWeek}
                                className="p-1.5 rounded-lg transition-colors btn-press"
                                style={{ color: 'var(--text-2)' }}
                                onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                                onMouseLeave={e=>e.currentTarget.style.background=''}>
                                <ChevronLeft size={18} />
                            </button>
                            <h2 className="text-base font-bold min-w-[200px] text-center capitalize" style={{ color: 'var(--text-1)' }}>
                                {headerTitle}
                            </h2>
                            <button
                                onClick={viewMode === 'month' ? nextMonth : nextWeek}
                                className="p-1.5 rounded-lg transition-colors btn-press"
                                style={{ color: 'var(--text-2)' }}
                                onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                                onMouseLeave={e=>e.currentTarget.style.background=''}>
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        {/* Controles derecha */}
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {/* Toggle mes/semana */}
                            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                                <button
                                    onClick={() => setViewMode('month')}
                                    className="px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                    style={viewMode === 'month' ? { background: 'var(--primary)', color: 'white' } : { background: 'transparent', color: 'var(--text-2)' }}
                                    onMouseEnter={e=>{ if(viewMode!=='month') e.currentTarget.style.background='var(--bg-hover)'; }}
                                    onMouseLeave={e=>{ if(viewMode!=='month') e.currentTarget.style.background=''; }}>
                                    <LayoutGrid size={13} /> Mes
                                </button>
                                <button
                                    onClick={() => setViewMode('week')}
                                    className="px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                                    style={viewMode === 'week' ? { background: 'var(--primary)', color: 'white' } : { background: 'transparent', color: 'var(--text-2)' }}
                                    onMouseEnter={e=>{ if(viewMode!=='week') e.currentTarget.style.background='var(--bg-hover)'; }}
                                    onMouseLeave={e=>{ if(viewMode!=='week') e.currentTarget.style.background=''; }}>
                                    <Calendar size={13} /> Semana
                                </button>
                            </div>

                            {/* Hoy */}
                            <button
                                onClick={() => { setCurrentDate(today); setSelectedDay(today); }}
                                className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors btn-press"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                                onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                                onMouseLeave={e=>e.currentTarget.style.background=''}>
                                Hoy
                            </button>

                            {/* Nueva cita */}
                            <button
                                onClick={() => setMostrarNuevaCita(true)}
                                className="text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors btn-press"
                                style={{ background: 'var(--primary)' }}
                                onMouseEnter={e=>e.currentTarget.style.background='var(--primary-hover)'}
                                onMouseLeave={e=>e.currentTarget.style.background='var(--primary)'}>
                                <Plus size={14} /> Nueva cita
                            </button>
                        </div>
                    </div>

                    {/* Cuerpo calendario */}
                    <div className="p-4 flex-1 flex flex-col justify-center overflow-auto min-h-[400px]">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="w-6 h-6 border-2 border-t-transparent rounded-full spin" style={{ borderColor: 'var(--primary)' }} />
                            </div>
                        ) : viewMode === 'month' ? (
                            <MonthView
                                year={year} month={month}
                                appointments={appointments}
                                selectedDay={selectedDay}
                                onSelectDay={handleSelectDay}
                            />
                        ) : (
                            <WeekView
                                weekStart={startOfWeek(currentDate)}
                                appointments={appointments}
                                selectedDay={selectedDay}
                                onSelectDay={handleSelectDay}
                            />
                        )}
                    </div>
                </div>

                {/* ── Panel lateral: citas ────────────────────────── */}
                <div className="w-full lg:w-80 flex-shrink-0 rounded-2xl shadow-sm border flex flex-col animate-fade-up card-base"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', animationDelay: '0.1s' }}>
                    <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
                        <h3 className="font-bold text-sm capitalize" style={{ color: 'var(--text-1)' }}>{panelTitulo}</h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                            {panelCitas.length} {panelCitas.length === 1 ? 'cita' : 'citas'}
                        </p>
                    </div>
                    <div className="p-4 flex-1 overflow-auto max-h-[500px]">
                        <CitasPanel
                            citas={panelCitas}
                            titulo={viewMode === 'week' ? 'Esta semana' : ''}
                            onFinalizar={setCitaSeleccionada}
                        />
                    </div>
                </div>
            </div>

            {/* Modal finalizar */}
            {citaSeleccionada && (
                <FinalizarModal
                    cita={citaSeleccionada}
                    onClose={() => setCitaSeleccionada(null)}
                    onConfirmar={handleConfirmar}
                />
            )}

            {/* Modal nueva cita */}
            {mostrarNuevaCita && (
                <NuevaCitaModal
                    onClose={() => setMostrarNuevaCita(false)}
                    onGuardar={createAppointment}
                    defaultDate={selectedDay ? selectedDay.toISOString().split('T')[0] : undefined}
                />
            )}
        </>
    );
}