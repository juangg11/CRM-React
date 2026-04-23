import React, { useState, useMemo } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import NuevaCitaModal from '../components/NuevaCitaModal';
import {
    Plus, X, ChevronLeft, ChevronRight,
    Calendar, LayoutGrid, Clock, User
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
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Finalizar cita</h2>
                        <p className="text-sm text-gray-500">{cita.client_name} · {cita.service}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                        <X size={20} />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Importe cobrado <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
                            <input
                                type="number" min="0" step="0.01" placeholder="0.00"
                                value={dinero} onChange={(e) => setDinero(e.target.value)} autoFocus
                                className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                        <textarea rows={3} placeholder="Observaciones de la cita…"
                            value={notas} onChange={(e) => setNotas(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleConfirmar} disabled={!dinero || guardando}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors">
                        {guardando ? 'Guardando…' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Chip de cita (en celda del calendario) ───────────────────────────────────

function CitaChip({ cita }) {
    return (
        <div className="text-[10px] leading-tight bg-blue-100 text-blue-800 rounded px-1 py-0.5 truncate font-medium text-center">
            {cita.appointment_time?.slice(0, 5)} {cita.client_name}
        </div>
    );
}

// ─── Panel lateral: citas del día / semana seleccionado ───────────────────────

function CitasPanel({ citas, titulo, onFinalizar }) {
    if (!citas.length) return (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Calendar size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Sin citas este día</p>
        </div>
    );

    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{titulo}</p>
            {citas.map((cita) => (
                <div key={cita.id}
                    className="group flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User size={14} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{cita.client_name}</p>
                        <p className="text-xs text-gray-500 truncate">{cita.service}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <Clock size={10} />
                            {cita.appointment_time?.slice(0, 5)}
                            <span className="mx-1">·</span>
                            {new Date(cita.appointment_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </div>
                    </div>
                    <button
                        onClick={() => onFinalizar(cita)}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded-lg transition-all font-medium">
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
        <div>
            {/* Cabecera días */}
            <div className="grid grid-cols-7 mb-1">
                {DAYS_ES.map((d) => (
                    <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
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
                            className={`
                                relative flex flex-col min-h-[80px] p-1.5 rounded-xl border text-left transition-all
                                ${isSelected ? 'border-blue-400 bg-blue-50 shadow-sm' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}
                                ${isToday && !isSelected ? 'border-blue-300 bg-blue-50/40' : ''}
                            `}>
                            <span className={`
                                text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1
                                ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}
                            `}>
                                {day}
                            </span>
                            <div className="flex-1 flex flex-col justify-center space-y-0.5 w-full overflow-hidden pb-1">
                                {dayCitas.slice(0, 2).map((c) => (
                                    <CitaChip key={c.id} cita={c} />
                                ))}
                                {dayCitas.length > 2 && (
                                    <div className="text-[10px] text-gray-400 font-medium pl-1 text-center">
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
        <div className="grid grid-cols-7 gap-1">
            {days.map((dateObj) => {
                const key = isoDate(dateObj);
                const dayCitas = citasByDay[key] ?? [];
                const isToday = sameDay(dateObj, today);
                const isSelected = selectedDay && sameDay(dateObj, selectedDay);

                return (
                    <button key={key} onClick={() => onSelectDay(dateObj)}
                        className={`
                            flex flex-col min-h-[140px] p-2 rounded-xl border text-left transition-all
                            ${isSelected ? 'border-blue-400 bg-blue-50 shadow-sm' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}
                            ${isToday && !isSelected ? 'border-blue-300 bg-blue-50/40' : ''}
                        `}>
                        {/* Header día */}
                        <div className="flex flex-col items-center mb-2">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase">
                                {DAYS_ES[(dateObj.getDay() + 6) % 7]}
                            </span>
                            <span className={`
                                text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                                ${isToday ? 'bg-blue-600 text-white' : 'text-gray-800'}
                            `}>
                                {dateObj.getDate()}
                            </span>
                        </div>
                        {/* Citas */}
                        <div className="flex-1 flex flex-col justify-center space-y-1 w-full pb-2">
                            {dayCitas.map((c) => (
                                <div key={c.id} className="bg-blue-100 text-blue-800 rounded-lg px-1.5 py-1 text-center">
                                    <p className="text-[10px] font-bold leading-tight">{c.appointment_time?.slice(0, 5)}</p>
                                    <p className="text-[10px] leading-tight truncate">{c.client_name}</p>
                                </div>
                            ))}
                            {!dayCitas.length && (
                                <p className="text-[10px] text-gray-300 text-center pt-2">—</p>
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
            <div className="flex gap-5 h-full">
                {/* ── Calendario ─────────────────────────────────── */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">

                    {/* Header */}
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-3">
                        {/* Navegación */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={viewMode === 'month' ? prevMonth : prevWeek}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
                                <ChevronLeft size={18} />
                            </button>
                            <h2 className="text-base font-bold text-gray-900 min-w-[200px] text-center capitalize">
                                {headerTitle}
                            </h2>
                            <button
                                onClick={viewMode === 'month' ? nextMonth : nextWeek}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        {/* Controles derecha */}
                        <div className="flex items-center gap-2">
                            {/* Toggle mes/semana */}
                            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => setViewMode('month')}
                                    className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors
                                        ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                                    <LayoutGrid size={13} /> Mes
                                </button>
                                <button
                                    onClick={() => setViewMode('week')}
                                    className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors
                                        ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                                    <Calendar size={13} /> Semana
                                </button>
                            </div>

                            {/* Hoy */}
                            <button
                                onClick={() => { setCurrentDate(today); setSelectedDay(today); }}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                Hoy
                            </button>

                            {/* Nueva cita */}
                            <button
                                onClick={() => setMostrarNuevaCita(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors">
                                <Plus size={14} /> Nueva cita
                            </button>
                        </div>
                    </div>

                    {/* Cuerpo calendario */}
                    <div className="p-4 flex-1 flex flex-col justify-center overflow-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
                <div className="w-80 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900 text-sm capitalize">{panelTitulo}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {panelCitas.length} {panelCitas.length === 1 ? 'cita' : 'citas'}
                        </p>
                    </div>
                    <div className="p-4 flex-1 overflow-auto">
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