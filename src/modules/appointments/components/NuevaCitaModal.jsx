import React, { useState } from 'react';
import { X, Calendar, Clock, User, Scissors, Check } from 'lucide-react';

const SERVICIOS = [
    'Corte de pelo', 'Tinte', 'Mechas', 'Peinado', 'Barba',
    'Manicura', 'Pedicura', 'Tratamiento', 'Extensiones', 'Otro',
];

const HORAS = Array.from({ length: 22 }, (_, i) => {
    const h = Math.floor(i / 2) + 9;        // 09:00 → 19:30
    const m = i % 2 === 0 ? '00' : '30';
    return `${String(h).padStart(2, '0')}:${m}`;
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
    const [errors, setErrors] = useState({});

    const set = (key, val) => {
        setForm(prev => ({ ...prev, [key]: val }));
        setErrors(prev => ({ ...prev, [key]: undefined }));
    };

    const validate = () => {
        const e = {};
        if (!form.client_name.trim()) e.client_name = 'El nombre es obligatorio';
        const srv = form.service === 'Otro' ? form.servicioCustom.trim() : form.service;
        if (!srv) e.service = 'Selecciona o escribe un servicio';
        if (!form.date) e.date = 'La fecha es obligatoria';
        if (!form.time) e.time = 'La hora es obligatoria';
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white">Nueva cita</h2>
                        <p className="text-blue-100 text-xs mt-0.5">Rellena los datos del cliente</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white">
                        <X size={16} />
                    </button>
                </div>

                {/* Formulario */}
                <div className="p-6 space-y-4">
                    {/* Nombre cliente */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                            Cliente <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Nombre completo"
                                value={form.client_name}
                                onChange={e => set('client_name', e.target.value)}
                                autoFocus
                                className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-shadow
                                    ${errors.client_name
                                        ? 'border-red-300 focus:ring-red-200'
                                        : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'}`}
                            />
                        </div>
                        {errors.client_name && <p className="text-xs text-red-500 mt-1">{errors.client_name}</p>}
                    </div>

                    {/* Servicio */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                            Servicio <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <Scissors size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                value={form.service}
                                onChange={e => set('service', e.target.value)}
                                className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 appearance-none bg-white transition-shadow
                                    ${errors.service
                                        ? 'border-red-300 focus:ring-red-200'
                                        : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'}`}>
                                <option value="">Seleccionar servicio…</option>
                                {SERVICIOS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        {form.service === 'Otro' && (
                            <input
                                type="text"
                                placeholder="Especificar servicio…"
                                value={form.servicioCustom}
                                onChange={e => set('servicioCustom', e.target.value)}
                                className="mt-2 w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                            />
                        )}
                        {errors.service && <p className="text-xs text-red-500 mt-1">{errors.service}</p>}
                    </div>

                    {/* Fecha + Hora en fila */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Fecha */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                Fecha <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={e => set('date', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full pl-9 pr-2 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-shadow
                                        ${errors.date
                                            ? 'border-red-300 focus:ring-red-200'
                                            : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'}`}
                                />
                            </div>
                            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                        </div>

                        {/* Hora */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                                Hora <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    value={form.time}
                                    onChange={e => set('time', e.target.value)}
                                    className={`w-full pl-9 pr-2 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 appearance-none bg-white transition-shadow
                                        ${errors.time
                                            ? 'border-red-300 focus:ring-red-200'
                                            : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'}`}>
                                    {HORAS.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                            {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleGuardar}
                        disabled={guardando}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                        {guardando ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <><Check size={15} /> Guardar cita</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
