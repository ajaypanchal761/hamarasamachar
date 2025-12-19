import { useState, useCallback } from 'react';

export const useConfirm = () => {
    const [confirmDialog, setConfirmDialog] = useState(null);

    const showConfirm = useCallback((options) => {
        return new Promise((resolve) => {
            setConfirmDialog({
                ...options,
                onConfirm: () => {
                    setConfirmDialog(null);
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmDialog(null);
                    resolve(false);
                }
            });
        });
    }, []);

    return { confirmDialog, showConfirm };
};


