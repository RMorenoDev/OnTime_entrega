import { useState, useRef, useEffect } from 'react';

/**
 * CustomSelect - Componente de Selector Personalizado
 * Reemplaza los elementos <select> nativos con un diseño consistente y moderno
 * Props: options (array), value, onChange, placeholder, disabled, required
 */
export default function CustomSelect({
    options = [],
    value,
    onChange,
    placeholder = "Select...",
    disabled = false,
    required = false
}) {
    const [isOpen, setIsOpen] = useState(false); // Controla apertura del menu
    const dropdownRef = useRef(null); // Ref para detectar clic fuera

    // Obtener texto a mostrar para el valor seleccionado
    const getDisplayText = () => {
        if (!value) return placeholder;
        const selected = options.find(opt => opt.value === value);
        return selected ? selected.label : placeholder;
    };

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Seleccionar opcion y cerrar
    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{
                    padding: '0.875rem 2.5rem 0.875rem 1rem',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    background: disabled ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                    color: value ? 'var(--white)' : 'rgba(255, 255, 255, 0.5)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'var(--transition)',
                    position: 'relative',
                    userSelect: 'none',
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '12px'
                }}
                onMouseEnter={(e) => {
                    if (!disabled) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!disabled) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }
                }}
            >
                {getDisplayText()}
            </div>

            {isOpen && options.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    backgroundColor: '#1a1a2e',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    marginTop: '4px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    zIndex: 1000
                }}>
                    {options.map((option, index) => (
                        <div
                            key={option.value || index}
                            onClick={() => handleSelect(option.value)}
                            style={{
                                padding: '0.75rem',
                                cursor: 'pointer',
                                borderBottom: index < options.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                                transition: 'background-color 0.2s',
                                color: '#fff',
                                backgroundColor: value === option.value ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                            onMouseLeave={(e) => {
                                if (value !== option.value) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
