import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, footer, maxWidth }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: 'hidden'
            }}
        >
            <div
                className={`bg-white rounded-2xl shadow-2xl shadow-black/20 w-full ${maxWidth || 'max-w-lg'} max-h-[90vh] sm:max-h-[85vh] flex flex-col border border-gray-200/50`}
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    margin: 0
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100/80 flex-shrink-0 bg-gradient-to-r from-gray-50/50 to-white">
                    <h3 className="text-xl font-bold text-gray-900 pr-3 tracking-tight">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100/80 transition-all duration-200 flex-shrink-0 group"
                    >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-6 border-t border-gray-100/80 bg-gradient-to-r from-gray-50/30 to-white rounded-b-2xl flex-shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
