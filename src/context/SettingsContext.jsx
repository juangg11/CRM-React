import { createContext, useContext, useState, useEffect } from 'react';

export const COLOR_PRESETS = {
    blue:   { primary: '#2563eb', hover: '#1d4ed8', light: '#2563eb26', medium: '#2563eb40', ring: 'rgba(37,99,235,0.35)', label: 'Azul' },
    purple: { primary: '#7c3aed', hover: '#6d28d9', light: '#7c3aed26', medium: '#7c3aed40', ring: 'rgba(124,58,237,0.35)', label: 'Morado' },
    rose:   { primary: '#e11d48', hover: '#be123c', light: '#e11d4826', medium: '#e11d4840', ring: 'rgba(225,29,72,0.35)', label: 'Rosa' },
    green:  { primary: '#16a34a', hover: '#15803d', light: '#16a34a26', medium: '#16a34a40', ring: 'rgba(22,163,74,0.35)',  label: 'Verde' },
    amber:  { primary: '#d97706', hover: '#b45309', light: '#d9770626', medium: '#d9770640', ring: 'rgba(217,119,6,0.35)',  label: 'Ámbar' },
    teal:   { primary: '#0d9488', hover: '#0f766e', light: '#0d948826', medium: '#0d948840', ring: 'rgba(13,148,136,0.35)',  label: 'Teal' },
};

const DEFAULT = {
    businessName:    'SalónCRM',
    businessTagline: 'Panel de gestión',
    primaryColor:    'blue',
    darkMode:        false,
    compactMode:     false,
    currency:        '€',
    language:        'es',
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('crm-settings') || '{}');
            return { ...DEFAULT, ...stored };
        } catch {
            return { ...DEFAULT };
        }
    });

    const updateSettings = (updates) =>
        setSettings(prev => {
            const next = { ...prev, ...updates };
            localStorage.setItem('crm-settings', JSON.stringify(next));
            return next;
        });

    // Apply CSS custom properties whenever settings change
    useEffect(() => {
        const c = COLOR_PRESETS[settings.primaryColor] ?? COLOR_PRESETS.blue;
        const root = document.documentElement;
        root.style.setProperty('--primary',        c.primary);
        root.style.setProperty('--primary-hover',  c.hover);
        root.style.setProperty('--primary-light',  c.light);
        root.style.setProperty('--primary-medium', c.medium);
        root.style.setProperty('--primary-ring',   c.ring);
    }, [settings.primaryColor]);

    useEffect(() => {
        document.body.classList.toggle('dark', settings.darkMode);
    }, [settings.darkMode]);

    const colorPreset = COLOR_PRESETS[settings.primaryColor] ?? COLOR_PRESETS.blue;

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, colorPreset, COLOR_PRESETS }}>
            {children}
        </SettingsContext.Provider>
    );
}

export const useSettings = () => useContext(SettingsContext);
