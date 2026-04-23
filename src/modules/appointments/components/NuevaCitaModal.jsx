import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Calendar, Clock, User, Scissors, Check, Search } from 'lucide-react';
import { useClients } from '../hooks/useClients';

const SERVICIOS = [
    'Corte de pelo', 'Tinte', 'Mechas', 'Peinado', 'Barba',
    'Manicura', 'Pedicura', 'Tratamiento', 'Extensiones', 'Otro',
];

const TODAS_LAS_HORAS = Array.from({ length: 22 }, (_, i) => {
    const h = Math.floor(i / 2) + 9; // 09:00 a 19:30
    const m = i % 2 === 0 ? '00' : '30';
    return `${String(h).padStart(2,'0')}:${m}`;
});

export default function NuevaCitaModal({ onClose, onGuardar, defaultDate, appointments = [] }) {
    const { clientes } = useClients();
    
    // ─── Estado del formulario ────────────────────────────────────────────────
    const [form, setForm] = useState({
        customer_id: null,
        client_name: '',
        service: '',
        servicioCustom: '',
        date: defaultDate ?? new Date().toISOString().split('T')[0],
        time: '',
    });
    const [guardando, setGuardando] = useState(false);
    const [errors, setErrors]       = useState({});

    // ─── Buscador de clientes ─────────────────────────────────────────────────
    const [searchClient, setSearchClient] = useState('');
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Cierra el dropdown al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowClientDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const clientesFiltrados = useMemo(() => {
        const q = searchClient.toLowerCase().trim();
        if (!q) return clientes;
        return clientes.filter(c => c.name.toLowerCase().includes(q) || c.phone?.includes(q));
    }, [clientes, searchClient]);

    const seleccionarCliente = (cliente) => {
        setForm(p => ({ ...p, customer_id: cliente.id, client_name: cliente.name }));
        setSearchClient(cliente.name);
        setShowClientDropdown(false);
        setErrors(p => ({ ...p, client_name: undefined }));
    };

    // ─── Lógica de horas disponibles ──────────────────────────────────────────
    const horasDisponibles = useMemo(() => {
        if (!form.date) return [];
        
        const now = new Date();
        const isToday = form.date === now.toISOString().split('T')[0];
        const currentHourMin = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

        // Citas ocupadas en la fecha seleccionada
        const ocupadas = appointments
            .filter(a => {
                if (!a.appointment_date) return false;
                const ad = new Date(a.appointment_date);
                if (isNaN(ad.getTime())) return false;
                return ad.toISOString().split('T')[0] === form.date;
            })
            .map(a => a.appointment_time?.slice(0, 5));

        return TODAS_LAS_HORAS.map(hora => {
            let disabled = false;
            let reason = '';
            
            if (isToday && hora < currentHourMin) {
                disabled = true;
                reason = 'Hora pasada';
            } else if (ocupadas.includes(hora)) {
                disabled = true;
                reason = 'Ocupada';
            }
            
            return { hora, disabled, reason };
        });
    }, [form.date, appointments]);

    // Autoseleccionar primera hora disponible si la actual no es válida
    useEffect(() => {
        if (!form.date) return;
        const currentHoraStatus = horasDisponibles.find(h => h.hora === form.time);
        if (!form.time || (currentHoraStatus && currentHoraStatus.disabled)) {
            const primeraLibre = horasDisponibles.find(h => !h.disabled);
            setForm(p => ({ ...p, time: primeraLibre ? primeraLibre.hora : '' }));
        }
    }, [form.date, horasDisponibles]);

    // ─── Utilidades ───────────────────────────────────────────────────────────
    const set = (k, v) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:undefined})); };

    const validate = () => {
        const e = {};
        if (!form.client_name.trim()) e.client_name = 'Selecciona un cliente';
        const srv = form.service === 'Otro' ? form.servicioCustom.trim() : form.service;
        if (!srv) e.service = 'Selecciona o escribe un servicio';
        if (!form.date) e.date = 'La fecha es obligatoria';
        if (!form.time) e.time = 'Selecciona una hora disponible';
        return e;
    };

    const handleGuardar = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setGuardando(true);
        const service = form.service === 'Otro' ? form.servicioCustom.trim() : form.service;
        await onGuardar({ ...form, service });
        setGuardando(false);
        onClose();
    };

    const fieldClass = (err) =>
        `input-base theme-ring w-full pl-9 pr-4 py-2.5 rounded-xl text-sm ${err ? 'border-red-400' : ''}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

            <div className="relative w-full max-w-md rounded-2xl shadow-2xl animate-scale-in flex flex-col max-h-[90vh]" style={{ background: 'var(--bg-card)' }}>

                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between flex-shrink-0 rounded-t-2xl"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))' }}>
                    <div>
                        <h2 className="text-lg font-bold text-white">Nueva cita</h2>
                        <p className="text-xs text-white/70 mt-0.5">Asignar cita a un cliente</p>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors btn-press">
                        <X size={16}/>
                    </button>
                </div>

                {/* Form - Scrollable */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1">

                    {/* Buscador de Cliente */}
                    <div ref={dropdownRef} className="relative">
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-3)' }}>
                            Cliente <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }}/>
                            <input 
                                type="text" 
                                placeholder="Buscar o crear cliente..."
                                value={searchClient}
                                onChange={e => {
                                    setSearchClient(e.target.value);
                                    setShowClientDropdown(true);
                                    if (form.customer_id) setForm(p => ({ ...p, customer_id: null, client_name: e.target.value }));
                                    else setForm(p => ({ ...p, client_name: e.target.value }));
                                    setErrors(p => ({ ...p, client_name: undefined }));
                                }}
                                onFocus={() => setShowClientDropdown(true)}
                                className={fieldClass(errors.client_name)}
                            />
                        </div>
                        
                        {/* Dropdown Clientes */}
                        {showClientDropdown && (
                            <div className="absolute z-10 w-full mt-1 rounded-xl shadow-lg border overflow-hidden animate-fade-up max-h-48 overflow-y-auto"
                                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                {clientesFiltrados.length > 0 ? (
                                    <ul className="py-1">
                                        {clientesFiltrados.map(c => (
                                            <li key={c.id}>
                                                <button 
                                                    onClick={() => seleccionarCliente(c)}
                                                    className="w-full text-left px-4 py-2 text-sm transition-colors flex flex-col"
                                                    style={{ color: 'var(--text-1)' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = ''}
                                                >
                                                    <span className="font-semibold">{c.name}</span>
                                                    {c.phone && <span className="text-xs" style={{ color: 'var(--text-3)' }}>{c.phone}</span>}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="px-4 py-3 text-sm text-center" style={{ color: 'var(--text-3)' }}>
                                        No se encontró cliente. <br/>
                                        <span className="text-xs mt-1 block">Se registrará uno nuevo con este nombre.</span>
                                    </div>
                                )}
                            </div>
                        )}
                        {errors.client_name && <p className="text-xs text-red-500 mt-1">{errors.client_name}</p>}
                        {form.customer_id && !showClientDropdown && (
                            <p className="text-xs mt-1 font-medium" style={{ color: 'var(--primary)' }}>✓ Cliente vinculado</p>
                        )}
                    </div>

                    {/* Servicio */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-3)' }}>
                            Servicio <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <Scissors size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }}/>
                            <select value={form.service} onChange={e=>set('service',e.target.value)}
                                className={`${fieldClass(errors.service)} appearance-none`}
                                style={{ background: 'var(--bg-input)' }}>
                                <option value="">Seleccionar servicio…</option>
                                {SERVICIOS.map(s=><option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        {form.service==='Otro' && (
                            <input type="text" placeholder="Especifica el servicio…"
                                value={form.servicioCustom} onChange={e=>set('servicioCustom',e.target.value)}
                                className="input-base theme-ring w-full px-4 py-2.5 rounded-xl text-sm mt-2"/>
                        )}
                        {errors.service && <p className="text-xs text-red-500 mt-1">{errors.service}</p>}
                    </div>

                    {/* Fecha */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-3)' }}>
                            Fecha <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }}/>
                            <input type="date" value={form.date} onChange={e=>set('date',e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className={`${fieldClass(errors.date)} pr-2`}/>
                        </div>
                        {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                    </div>
                    
                    {/* Hora Grid */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 flex items-center justify-between" style={{ color: 'var(--text-3)' }}>
                            <span>Hora <span className="text-red-400">*</span></span>
                            {form.time && <span style={{ color: 'var(--primary)' }}>{form.time} seleccionada</span>}
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1">
                            {horasDisponibles.map(({ hora, disabled, reason }) => {
                                const isSelected = form.time === hora;
                                return (
                                    <button
                                        key={hora}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => set('time', hora)}
                                        title={reason}
                                        className={`py-2 rounded-lg text-xs font-bold transition-all ${disabled ? 'opacity-40 cursor-not-allowed' : 'btn-press'}`}
                                        style={isSelected 
                                            ? { background: 'var(--primary)', color: 'white', boxShadow: '0 0 0 2px var(--primary-ring)' } 
                                            : { background: 'var(--bg-input)', color: 'var(--text-1)', border: '1px solid var(--border-in)' }
                                        }
                                        onMouseEnter={e => { if(!disabled && !isSelected) e.currentTarget.style.borderColor = 'var(--primary)'; }}
                                        onMouseLeave={e => { if(!disabled && !isSelected) e.currentTarget.style.borderColor = 'var(--border-in)'; }}
                                    >
                                        <span className={disabled && reason === 'Ocupada' ? 'line-through' : ''}>{hora}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
                        {!horasDisponibles.some(h => !h.disabled) && (
                            <p className="text-xs text-orange-500 mt-1">No hay horas disponibles este día.</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 flex gap-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
                    <button onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors btn-press"
                        style={{ borderColor: 'var(--border-in)', color: 'var(--text-2)' }}>
                        Cancelar
                    </button>
                    <button onClick={handleGuardar} disabled={guardando || !form.time}
                        className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 btn-press transition-colors"
                        style={{ background: 'var(--primary)' }}
                        onMouseEnter={e=>{ if(!guardando && form.time) e.currentTarget.style.background='var(--primary-hover)'; }}
                        onMouseLeave={e=>e.currentTarget.style.background='var(--primary)'}>
                        {guardando
                            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spin"/>
                            : <><Check size={14}/> Guardar cita</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
