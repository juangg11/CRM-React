import React, { useState } from 'react';
import { X, Calendar, Clock, User, Scissors, Check } from 'lucide-react';

const SERVICIOS = [
    'Corte de pelo', 'Tinte', 'Mechas', 'Peinado', 'Barba',
    'Manicura', 'Pedicura', 'Tratamiento', 'Extensiones', 'Otro',
];

const HORAS = Array.from({ length: 22 }, (_, i) => {
    const h = Math.floor(i / 2) + 9;
    const m = i % 2 === 0 ? '00' : '30';
    return `${String(h).padStart(2,'0')}:${m}`;
});

export default function NuevaCitaModal({ onClose, onGuardar, defaultDate }) {
    const [form, setForm] = useState({
        client_name: '',
        service: '',
        servicioCustom: '',
        date: defaultDate ?? new Date().toISOString().split('T')[0],
        time: '09:00',
    });
    const [guardando, setGuardando] = useState(false);
    const [errors, setErrors]       = useState({});

    const set = (k, v) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:undefined})); };

    const validate = () => {
        const e = {};
        if (!form.client_name.trim()) e.client_name = 'El nombre es obligatorio';
        const srv = form.service === 'Otro' ? form.servicioCustom.trim() : form.service;
        if (!srv) e.service = 'Selecciona o escribe un servicio';
        if (!form.date) e.date = 'La fecha es obligatoria';
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

            <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-scale-in" style={{ background: 'var(--bg-card)' }}>

                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))' }}>
                    <div>
                        <h2 className="text-lg font-bold text-white">Nueva cita</h2>
                        <p className="text-xs text-white/70 mt-0.5">Rellena los datos del cliente</p>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors btn-press">
                        <X size={16}/>
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">

                    {/* Cliente */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-3)' }}>
                            Cliente <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }}/>
                            <input autoFocus type="text" placeholder="Nombre completo"
                                value={form.client_name} onChange={e=>set('client_name',e.target.value)}
                                className={fieldClass(errors.client_name)}/>
                        </div>
                        {errors.client_name && <p className="text-xs text-red-500 mt-1">{errors.client_name}</p>}
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

                    {/* Fecha + Hora */}
                    <div className="grid grid-cols-2 gap-3">
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
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-3)' }}>
                                Hora
                            </label>
                            <div className="relative">
                                <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }}/>
                                <select value={form.time} onChange={e=>set('time',e.target.value)}
                                    className="input-base theme-ring w-full pl-9 pr-2 py-2.5 rounded-xl text-sm appearance-none"
                                    style={{ background: 'var(--bg-input)' }}>
                                    {HORAS.map(h=><option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors btn-press"
                        style={{ borderColor: 'var(--border-in)', color: 'var(--text-2)' }}>
                        Cancelar
                    </button>
                    <button onClick={handleGuardar} disabled={guardando}
                        className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 btn-press transition-colors"
                        style={{ background: 'var(--primary)' }}
                        onMouseEnter={e=>{ if(!guardando) e.currentTarget.style.background='var(--primary-hover)'; }}
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
