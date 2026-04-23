import React, { useState, useMemo } from 'react';
import { useClients } from '../hooks/useClients';
import {
    Search, Plus, X, User, Mail, Phone,
    Pencil, Trash2, Check, Users, AlertTriangle
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
    'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700',
    'bg-green-100 text-green-700', 'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700', 'bg-teal-100 text-teal-700',
];

function initials(name = '') {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}
function avatarColor(name = '') {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + h * 31;
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ─── Modal Añadir / Editar ────────────────────────────────────────────────
const EMPTY = { name: '', email: '', phone: '' };

function ClienteModal({ cliente, onClose, onGuardar }) {
    const isEdit = Boolean(cliente);
    const [form, setForm] = useState(isEdit ? { name: cliente.name, email: cliente.email || '', phone: cliente.phone || '' } : { ...EMPTY });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: undefined })); };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'El nombre es obligatorio';
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email no válido';
        return e;
    };

    const handleSave = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setSaving(true);
        try { await onGuardar(form); onClose(); }
        catch { setErrors({ name: 'Error al guardar. Inténtalo de nuevo.' }); }
        finally { setSaving(false); }
    };

    const accentStyle = isEdit
        ? { background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }
        : { background: 'linear-gradient(135deg,var(--primary),var(--primary-hover))' };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-scale-in" style={{ background: 'var(--bg-card)' }}>

                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between" style={accentStyle}>
                    <div>
                        <h2 className="text-lg font-bold text-white">{isEdit ? 'Editar cliente' : 'Nuevo cliente'}</h2>
                        <p className="text-xs text-white/70 mt-0.5">{isEdit ? `Modificando a ${cliente.name}` : 'Rellena los datos'}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {[
                        { key: 'name',  icon: User,  type: 'text',  label: 'Nombre completo', required: true, placeholder: 'Ej: Ana García' },
                        { key: 'email', icon: Mail,  type: 'email', label: 'Email',            required: false, placeholder: 'correo@ejemplo.com' },
                        { key: 'phone', icon: Phone, type: 'tel',   label: 'Teléfono',         required: false, placeholder: '600 000 000' },
                    ].map(({ key, icon: Icon, type, label, required, placeholder }) => (
                        <div key={key}>
                            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-3)' }}>
                                {label} {required && <span className="text-red-400">*</span>}
                            </label>
                            <div className="relative">
                                <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
                                <input
                                    autoFocus={key === 'name'}
                                    type={type} placeholder={placeholder}
                                    value={form[key]} onChange={e => set(key, e.target.value)}
                                    className={`input-base theme-ring w-full pl-9 pr-4 py-2.5 rounded-xl text-sm ${errors[key] ? 'border-red-400' : ''}`}
                                />
                            </div>
                            {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors btn-press" style={{ borderColor: 'var(--border-in)', color: 'var(--text-2)' }}>
                        Cancelar
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 btn-press transition-colors"
                        style={accentStyle}>
                        {saving
                            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spin" />
                            : <><Check size={14} />{isEdit ? 'Guardar cambios' : 'Añadir cliente'}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Modal Confirmar eliminación ──────────────────────────────────────────
function ConfirmarModal({ cliente, onClose, onConfirmar }) {
    const [deleting, setDeleting] = useState(false);
    const handle = async () => { setDeleting(true); await onConfirmar(cliente.id); setDeleting(false); onClose(); };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-scale-in" style={{ background: 'var(--bg-card)' }}>
                <div className="flex flex-col items-center text-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle size={22} className="text-red-500" />
                    </div>
                    <div>
                        <h2 className="font-bold" style={{ color: 'var(--text-1)' }}>¿Eliminar cliente?</h2>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
                            Vas a eliminar a <span className="font-semibold" style={{ color: 'var(--text-1)' }}>{cliente.name}</span>. Esta acción no se puede deshacer.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold btn-press" style={{ borderColor: 'var(--border-in)', color: 'var(--text-2)' }}>
                        Cancelar
                    </button>
                    <button onClick={handle} disabled={deleting} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 btn-press transition-colors">
                        {deleting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spin" /> : <><Trash2 size={14} />Eliminar</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Tarjeta de cliente ───────────────────────────────────────────────────
function ClienteCard({ cliente, onEditar, onEliminar, index }) {
    const color = avatarColor(cliente.name);
    return (
        <div className={`card-base card-float p-5 flex flex-col gap-4 animate-fade-up stagger-${Math.min(index + 1, 5)}`}
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${color}`}>
                    {initials(cliente.name)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--text-1)' }}>{cliente.name}</p>
                    {cliente.email
                        ? <p className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{cliente.email}</p>
                        : <p className="text-xs italic" style={{ color: 'var(--text-3)' }}>Sin email</p>}
                </div>
            </div>

            {cliente.phone && (
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-2)' }}>
                    <Phone size={12} style={{ color: 'var(--text-3)' }} />
                    {cliente.phone}
                </div>
            )}

            <div className="flex gap-2 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                <button onClick={() => onEditar(cliente)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors btn-press"
                    style={{ color: 'var(--text-2)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-light)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-2)'; }}>
                    <Pencil size={12} /> Editar
                </button>
                <button onClick={() => onEliminar(cliente)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-colors btn-press"
                    style={{ color: 'var(--text-2)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#e11d48'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-2)'; }}>
                    <Trash2 size={12} /> Eliminar
                </button>
            </div>
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────
export default function ClientsPage() {
    const { clientes, loading, createCliente, updateCliente, deleteCliente } = useClients();
    const [busqueda, setBusqueda]         = useState('');
    const [modalNuevo, setModalNuevo]     = useState(false);
    const [editando, setEditando]         = useState(null);
    const [eliminando, setEliminando]     = useState(null);

    const filtrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        if (!q) return clientes;
        return clientes.filter(c =>
            c.name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.phone?.toLowerCase().includes(q)
        );
    }, [clientes, busqueda]);

    return (
        <div className="flex flex-col gap-5 h-full">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-up">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>Clientes</h1>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
                        {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado{clientes.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button onClick={() => setModalNuevo(true)}
                    className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm self-start sm:self-auto btn-press"
                    style={{ background: 'var(--primary)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}>
                    <Plus size={16} /> Añadir cliente
                </button>
            </div>

            {/* Buscador */}
            <div className="relative animate-fade-up" style={{ animationDelay: '0.05s' }}>
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
                <input type="text" placeholder="Buscar por nombre, email o teléfono…"
                    value={busqueda} onChange={e => setBusqueda(e.target.value)}
                    className="input-base theme-ring w-full pl-11 pr-10 py-3 rounded-2xl text-sm shadow-sm" />
                {busqueda && (
                    <button onClick={() => setBusqueda('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: 'var(--text-3)' }}>
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Contenido */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            <div className="flex items-center gap-3">
                                <div className="skeleton w-11 h-11 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="skeleton h-3.5 rounded w-3/4" />
                                    <div className="skeleton h-2.5 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="skeleton h-3 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : filtrados.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 animate-fade-up">
                    <Users size={48} style={{ color: 'var(--text-3)', opacity: 0.4 }} />
                    {busqueda
                        ? <>
                            <p className="font-semibold" style={{ color: 'var(--text-2)' }}>Sin resultados para "{busqueda}"</p>
                            <p className="text-sm" style={{ color: 'var(--text-3)' }}>Prueba con otro nombre o teléfono</p>
                          </>
                        : <>
                            <p className="font-semibold" style={{ color: 'var(--text-2)' }}>No hay clientes todavía</p>
                            <button onClick={() => setModalNuevo(true)}
                                className="mt-1 flex items-center gap-2 text-white px-4 py-2 rounded-xl text-sm font-semibold btn-press"
                                style={{ background: 'var(--primary)' }}>
                                <Plus size={14} /> Añadir el primero
                            </button>
                          </>}
                </div>
            ) : (
                <>
                    {busqueda && (
                        <p className="text-xs -mt-1 animate-fade-up" style={{ color: 'var(--text-3)' }}>
                            {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''} para{' '}
                            <span className="font-semibold" style={{ color: 'var(--primary)' }}>"{busqueda}"</span>
                        </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filtrados.map((c, i) => (
                            <ClienteCard key={c.id} cliente={c} index={i}
                                onEditar={setEditando} onEliminar={setEliminando} />
                        ))}
                    </div>
                </>
            )}

            {/* Modales */}
            {modalNuevo && (
                <ClienteModal onClose={() => setModalNuevo(false)} onGuardar={createCliente} />
            )}
            {editando && (
                <ClienteModal cliente={editando} onClose={() => setEditando(null)}
                    onGuardar={f => updateCliente(editando.id, f)} />
            )}
            {eliminando && (
                <ConfirmarModal cliente={eliminando} onClose={() => setEliminando(null)}
                    onConfirmar={deleteCliente} />
            )}
        </div>
    );
}