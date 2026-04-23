import React, { useState } from 'react';
import { useSettings, COLOR_PRESETS } from '../../../context/SettingsContext';
import {
    Palette, Moon, Sun, Type, Building2, Check,
    Globe, Coins, Layout, Zap
} from 'lucide-react';

// ─── Toggle Switch ─────────────────────────────────────────────────────────
function Toggle({ on, onChange }) {
    return (
        <button
            onClick={() => onChange(!on)}
            className={`toggle ${on ? 'on' : ''}`}
            aria-checked={on}
            role="switch"
        />
    );
}

// ─── Section wrapper ───────────────────────────────────────────────────────
function Section({ icon: Icon, title, description, children }) {
    return (
        <div
            className="card-base p-6 animate-fade-up"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
            <div className="flex items-start gap-4 mb-5">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--primary-light)' }}
                >
                    <Icon size={17} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                    <h2 className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>{title}</h2>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{description}</p>
                </div>
            </div>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

// ─── Row option ───────────────────────────────────────────────────────────
function Row({ label, hint, children }) {
    return (
        <div className="flex items-center justify-between gap-4 py-1">
            <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{label}</p>
                {hint && <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{hint}</p>}
            </div>
            <div className="flex-shrink-0">{children}</div>
        </div>
    );
}

// ─── Input de texto ────────────────────────────────────────────────────────
function SettingInput({ value, onChange, placeholder }) {
    return (
        <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="input-base theme-ring w-52 px-3 py-2 rounded-xl text-sm"
        />
    );
}

// ─── Toast ─────────────────────────────────────────────────────────────────
function Toast({ show }) {
    if (!show) return null;
    return (
        <div
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl animate-scale-in text-white text-sm font-semibold"
            style={{ background: 'var(--primary)' }}
        >
            <Check size={15} /> Configuración guardada
        </div>
    );
}

// ─── Página principal ──────────────────────────────────────────────────────
export default function SettingsPage() {
    const { settings, updateSettings, COLOR_PRESETS } = useSettings();
    const [toast, setToast] = useState(false);

    const save = (updates) => {
        updateSettings(updates);
        setToast(true);
        setTimeout(() => setToast(false), 2200);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-5 pb-8">

            {/* Header */}
            <div className="animate-fade-up">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>Configuración</h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
                    Personaliza tu panel de gestión
                </p>
            </div>

            {/* ── Negocio ── */}
            <Section icon={Building2} title="Negocio" description="Información de tu establecimiento">
                <Row label="Nombre del negocio" hint="Aparece en el menú lateral">
                    <SettingInput
                        value={settings.businessName}
                        onChange={v => save({ businessName: v })}
                        placeholder="SalónCRM"
                    />
                </Row>
                <div className="border-t" style={{ borderColor: 'var(--border)' }} />
                <Row label="Lema / Subtítulo" hint="Texto bajo el nombre en el sidebar">
                    <SettingInput
                        value={settings.businessTagline}
                        onChange={v => save({ businessTagline: v })}
                        placeholder="Panel de gestión"
                    />
                </Row>
                <div className="border-t" style={{ borderColor: 'var(--border)' }} />
                <Row label="Moneda" hint="Símbolo usado en ventas y facturas">
                    <select
                        value={settings.currency}
                        onChange={e => save({ currency: e.target.value })}
                        className="input-base theme-ring px-3 py-2 rounded-xl text-sm appearance-none"
                        style={{ minWidth: '90px' }}
                    >
                        <option value="€">€ Euro</option>
                        <option value="$">$ Dólar</option>
                        <option value="£">£ Libra</option>
                    </select>
                </Row>
            </Section>

            {/* ── Apariencia ── */}
            <Section icon={Palette} title="Apariencia" description="Tema visual y colores del panel">

                {/* Color primario */}
                <div>
                    <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-1)' }}>Color principal</p>
                    <div className="flex gap-3 flex-wrap">
                        {Object.entries(COLOR_PRESETS).map(([key, c]) => (
                            <button
                                key={key}
                                onClick={() => save({ primaryColor: key })}
                                title={c.label}
                                className={`color-swatch btn-press ${settings.primaryColor === key ? 'selected' : ''}`}
                                style={{ background: c.primary }}
                            />
                        ))}
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'var(--text-3)' }}>
                        Seleccionado: <span className="font-semibold" style={{ color: 'var(--primary)' }}>
                            {COLOR_PRESETS[settings.primaryColor]?.label}
                        </span>
                    </p>
                </div>

                <div className="border-t" style={{ borderColor: 'var(--border)' }} />

                {/* Modo oscuro */}
                <Row
                    label="Modo oscuro"
                    hint="Cambia el fondo del panel a tonos oscuros"
                >
                    <div className="flex items-center gap-2">
                        <Sun size={14} style={{ color: 'var(--text-3)' }} />
                        <Toggle on={settings.darkMode} onChange={v => save({ darkMode: v })} />
                        <Moon size={14} style={{ color: 'var(--text-3)' }} />
                    </div>
                </Row>

                <div className="border-t" style={{ borderColor: 'var(--border)' }} />

                {/* Modo compacto */}
                <Row
                    label="Modo compacto"
                    hint="Reduce el espaciado para ver más contenido"
                >
                    <Toggle on={settings.compactMode} onChange={v => save({ compactMode: v })} />
                </Row>
            </Section>

            {/* ── Vista previa ── */}
            <Section icon={Layout} title="Vista previa del tema" description="Así se verán los elementos principales">
                <div className="grid grid-cols-2 gap-3">
                    {/* Botón primario */}
                    <button
                        className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold btn-press"
                        style={{ background: 'var(--primary)' }}
                    >
                        Botón principal
                    </button>
                    {/* Badge */}
                    <div
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center"
                        style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                    >
                        Badge / Chip
                    </div>
                    {/* Input */}
                    <input
                        className="col-span-2 input-base theme-ring px-3 py-2 rounded-xl text-sm"
                        placeholder="Campo de texto de ejemplo…"
                        readOnly
                    />
                </div>
            </Section>

            {/* ── Rendimiento ── */}
            <Section icon={Zap} title="Rendimiento" description="Opciones de comportamiento del panel">
                <Row label="Animaciones" hint="Desactiva si el panel va lento">
                    <Toggle
                        on={settings.animations !== false}
                        onChange={v => save({ animations: v })}
                    />
                </Row>
            </Section>

            <Toast show={toast} />
        </div>
    );
}
