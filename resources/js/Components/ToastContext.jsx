import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 5000) => {
        const id = Math.random().toString(36).substr(2, 9);
        const toast = { id, message, type };

        setToasts((prev) => [...prev, toast]);

        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const show = useCallback((message, type = 'info') => {
        return addToast(message, type, 5000);
    }, [addToast]);

    const success = useCallback((message) => {
        return addToast(message, 'success', 5000);
    }, [addToast]);

    const error = useCallback((message) => {
        return addToast(message, 'error', 5000);
    }, [addToast]);

    const info = useCallback((message) => {
        return addToast(message, 'info', 5000);
    }, [addToast]);

    const warning = useCallback((message) => {
        return addToast(message, 'warning', 5000);
    }, [addToast]);

    const value = {
        toasts,
        addToast,
        removeToast,
        show,
        success,
        error,
        info,
        warning,
    };

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
