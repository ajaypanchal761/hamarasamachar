import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Youtube } from '@tiptap/extension-youtube';
import { Link } from '@tiptap/extension-link';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extension-placeholder';
import { BubbleMenu as BubbleMenuExtension } from '@tiptap/extension-bubble-menu';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { COLORS } from '../constants/colors';
import { useState, useEffect, useRef } from 'react';
import { useConfirm } from '../hooks/useConfirm';
import ConfirmDialog from './ConfirmDialog';

const ResizableImageComponent = ({ node, updateAttributes }) => {
    const [isResizing, setIsResizing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startWidth, setStartWidth] = useState(0);
    const imgRef = useRef(null);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsResizing(true);
        setStartX(e.clientX);
        setStartWidth(imgRef.current?.offsetWidth || 0);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            const diff = e.clientX - startX;
            const newWidth = Math.max(100, Math.min(800, startWidth + diff));
            updateAttributes({ width: `${newWidth}px` });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, startX, startWidth, updateAttributes]);

    const imageElement = (
        <div className="relative inline-block" style={{ width: node.attrs.width || '100%' }}>
            <img
                ref={imgRef}
                src={node.attrs.src}
                alt={node.attrs.alt}
                style={{ width: '100%', height: 'auto', borderRadius: '0.5rem', display: 'block' }}
                className="shadow-sm border border-gray-200"
            />
            {/* Resize Handle */}
            <div
                onMouseDown={handleMouseDown}
                className="absolute bottom-0 right-0 w-4 h-4 bg-[#E21E26] cursor-se-resize rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ cursor: 'se-resize' }}
            />
        </div>
    );

    const href = node.attrs.href;
    const isValidLink = href && !href.includes('localhost') && !href.startsWith('http://localhost') && !href.startsWith('https://localhost');

    const alignment = node.attrs.align || 'left';
    const justifyClass = alignment === 'left' ? 'justify-start' : alignment === 'center' ? 'justify-center' : 'justify-end';

    return (
        <NodeViewWrapper className={`flex w-full ${justifyClass} relative group my-2`}>
            <div className="relative inline-block transition-all duration-200">
                {isValidLink ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
                        {imageElement}
                    </a>
                ) : (
                    imageElement
                )}

                {/* Controls Overlay */}
                <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md rounded-lg flex flex-col gap-1.5 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 shadow-lg border border-white/10">
                    {/* Alignment Buttons */}
                    <div className="flex gap-1 border-b border-white/20 pb-1.5 mb-1">
                        <button
                            onClick={() => updateAttributes({ align: 'left' })}
                            className={`text-[10px] sm:text-xs px-1.5 py-1 rounded transition-colors ${alignment === 'left' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            type="button"
                            title="बाएं (Left)"
                        >
                            ⬅
                        </button>
                        <button
                            onClick={() => updateAttributes({ align: 'center' })}
                            className={`text-[10px] sm:text-xs px-1.5 py-1 rounded transition-colors ${alignment === 'center' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            type="button"
                            title="केंद्र (Center)"
                        >
                            ⬌
                        </button>
                        <button
                            onClick={() => updateAttributes({ align: 'right' })}
                            className={`text-[10px] sm:text-xs px-1.5 py-1 rounded transition-colors ${alignment === 'right' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            type="button"
                            title="दाएं (Right)"
                        >
                            ➡
                        </button>
                    </div>
                    {/* Link Button */}
                    <button
                        onClick={() => {
                            const currentLink = node.attrs.href;
                            const url = window.prompt('Link URL (खाली छोड़ने से link हटेगा):', currentLink || '');
                            if (url === null) return;
                            // Silently reject localhost links without alert
                            if (url && (url.includes('localhost') || url.startsWith('http://localhost') || url.startsWith('https://localhost'))) {
                                return;
                            }
                            updateAttributes({ href: url || null });
                        }}
                        className={`text-[10px] sm:text-xs px-1.5 py-1 rounded transition-colors ${node.attrs.href ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        type="button"
                        title="Link जोड़ें/हटाएं"
                    >
                        🔗
                    </button>
                </div>
            </div>
        </NodeViewWrapper>
    );
};

const CustomImageExtension = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: '100%',
                renderHTML: attributes => ({
                    width: attributes.width,
                }),
            },
            align: {
                default: 'left',
                renderHTML: attributes => ({
                    'data-align': attributes.align,
                }),
            },
            href: {
                default: null,
                parseHTML: element => element.getAttribute('href') || element.closest('a')?.getAttribute('href'),
                renderHTML: attributes => {
                    if (!attributes.href) {
                        return {};
                    }
                    return { href: attributes.href };
                },
            },
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageComponent);
    },
});

const ResizableVideoComponent = ({ node, updateAttributes }) => {
    const [isResizing, setIsResizing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startWidth, setStartWidth] = useState(0);
    const videoRef = useRef(null);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsResizing(true);
        setStartX(e.clientX);
        setStartWidth(videoRef.current?.offsetWidth || 0);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            const diff = e.clientX - startX;
            const newWidth = Math.max(100, Math.min(800, startWidth + diff));
            updateAttributes({ width: `${newWidth}px` });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, startX, startWidth, updateAttributes]);

    const videoElement = (
        <div className="relative inline-block" style={{ width: node.attrs.width || '100%' }}>
            <video
                ref={videoRef}
                src={node.attrs.src}
                controls
                style={{ width: '100%', height: 'auto', borderRadius: '0.5rem', display: 'block' }}
                className="shadow-sm border border-gray-200"
            />
            {/* Resize Handle */}
            <div
                onMouseDown={handleMouseDown}
                className="absolute bottom-0 right-0 w-4 h-4 bg-[#E21E26] cursor-se-resize rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ cursor: 'se-resize' }}
            />
        </div>
    );

    const href = node.attrs.href;
    const isValidLink = href && !href.includes('localhost') && !href.startsWith('http://localhost') && !href.startsWith('https://localhost');

    const alignment = node.attrs.align || 'left';
    const justifyClass = alignment === 'left' ? 'justify-start' : alignment === 'center' ? 'justify-center' : 'justify-end';

    return (
        <NodeViewWrapper className={`flex w-full ${justifyClass} relative group my-2`}>
            <div className="relative inline-block transition-all duration-200">
                {isValidLink ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
                        {videoElement}
                    </a>
                ) : (
                    videoElement
                )}

                {/* Controls Overlay */}
                <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md rounded-lg flex flex-col gap-1.5 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 shadow-lg border border-white/10">
                    {/* Alignment Buttons */}
                    <div className="flex gap-1 border-b border-white/20 pb-1.5 mb-1">
                        <button
                            type="button"
                            onClick={() => updateAttributes({ align: 'left' })}
                            className={`text-[10px] sm:text-xs px-1.5 py-1 rounded transition-colors ${alignment === 'left' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            title="बाएं (Left)"
                        >
                            ⬅
                        </button>
                        <button
                            type="button"
                            onClick={() => updateAttributes({ align: 'center' })}
                            className={`text-[10px] sm:text-xs px-1.5 py-1 rounded transition-colors ${alignment === 'center' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            title="केंद्र (Center)"
                        >
                            ⬌
                        </button>
                        <button
                            type="button"
                            onClick={() => updateAttributes({ align: 'right' })}
                            className={`text-[10px] sm:text-xs px-1.5 py-1 rounded transition-colors ${alignment === 'right' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            title="दाएं (Right)"
                        >
                            ➡
                        </button>
                    </div>
                    {/* Link Button */}
                    <button
                        type="button"
                        onClick={() => {
                            const currentLink = node.attrs.href;
                            const url = window.prompt('Link URL (खाली छोड़ने से link हटेगा):', currentLink || '');
                            if (url === null) return;
                            // Silently reject localhost links without alert
                            if (url && (url.includes('localhost') || url.startsWith('http://localhost') || url.startsWith('https://localhost'))) {
                                return;
                            }
                            updateAttributes({ href: url || null });
                        }}
                        className={`text-[10px] sm:text-xs px-1.5 py-1 rounded transition-colors ${node.attrs.href ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        title="Link जोड़ें/हटाएं"
                    >
                        🔗
                    </button>
                </div>
            </div>
        </NodeViewWrapper>
    );
};

const VideoExtension = Node.create({
    name: 'video',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            src: { default: null },
            width: { default: '100%' },
            align: { default: 'left' },
            href: {
                default: null,
                parseHTML: element => element.getAttribute('href') || element.closest('a')?.getAttribute('href'),
                renderHTML: attributes => {
                    if (!attributes.href) {
                        return {};
                    }
                    return { href: attributes.href };
                },
            },
        }
    },

    parseHTML() {
        return [{ tag: 'video' }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['video', mergeAttributes(HTMLAttributes, { controls: true })]
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableVideoComponent);
    },
});

const MenuBar = ({ editor, showConfirm, showPreview, setShowPreview }) => {
    const [showTableMenu, setShowTableMenu] = useState(false);
    const [showTableActionsMenu, setShowTableActionsMenu] = useState(false);
    const tableMenuRef = useRef(null);
    const tableActionsMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tableMenuRef.current && !tableMenuRef.current.contains(event.target)) {
                setShowTableMenu(false);
            }
        };

        if (showTableMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showTableMenu]);

    if (!editor) {
        return null;
    }

    // Check if cursor is actually inside a table - more specific check
    const isTableActive = editor.isActive('tableCell') || editor.isActive('tableHeader') || editor.isActive('tableRow');

    return (
        <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50 rounded-t-lg sticky top-0 z-10">

            {/* Undo/Redo */}
            <button 
                type="button"
                onClick={() => editor.chain().focus().undo().run()} 
                disabled={!editor.can().undo()}
                className={`p-2 rounded hover:bg-gray-100 ${!editor.can().undo() ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Undo (Ctrl+Z)"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
            </button>
            <button 
                type="button"
                onClick={() => editor.chain().focus().redo().run()} 
                disabled={!editor.can().redo()}
                className={`p-2 rounded hover:bg-gray-100 ${!editor.can().redo() ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Redo (Ctrl+Y)"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 0 0-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

            {/* Main Formatting Actions (Always Visible) */}
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'text-red-600 bg-red-50' : ''}`}><strong>B</strong></button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'text-red-600 bg-red-50' : ''}`}><em>I</em></button>
            <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('underline') ? 'text-red-600 bg-red-50' : ''}`}><u>U</u></button>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

            {/* Common Blocks */}
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded text-sm font-bold hover:bg-gray-100 ${editor.isActive('heading', { level: 1 }) ? 'text-red-600 bg-red-50' : ''}`}>H1</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded text-sm font-bold hover:bg-gray-100 ${editor.isActive('heading', { level: 2 }) ? 'text-red-600 bg-red-50' : ''}`}>H2</button>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

            {/* Lists */}
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'text-red-600 bg-red-50' : ''}`}>• List</button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'text-red-600 bg-red-50' : ''}`}>1. List</button>

            {/* Quote/Blockquote */}
            <button 
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()} 
                className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('blockquote') ? 'text-red-600 bg-red-50' : ''}`}
                title="Quote"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

            {/* Table Insert Button - Always visible */}
            <div className="relative" ref={tableMenuRef}>
                <button 
                    type="button"
                    onClick={() => setShowTableMenu(!showTableMenu)}
                    className="p-2 rounded hover:bg-gray-100"
                    title="टेबल जोड़ें (Insert Table)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 3v18M14 3v18M3 6h18v12H3V6z" />
                    </svg>
                </button>
                
                {/* Table Insert Dropdown Menu - Only shows insert options */}
                {showTableMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[200px] z-20">
                        <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-2">टेबल जोड़ें (Insert Table)</div>
                        <div className="grid grid-cols-4 gap-1">
                            {[2, 3, 4, 5].map(rows => (
                                [2, 3, 4, 5].map(cols => (
                                    <button
                                        type="button"
                                        key={`${rows}-${cols}`}
                                        onClick={() => {
                                            editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
                                            setShowTableMenu(false);
                                        }}
                                        className="w-8 h-8 border border-gray-300 hover:bg-blue-50 hover:border-blue-400 rounded text-xs flex items-center justify-center transition-colors"
                                        title={`${rows}x${cols} टेबल`}
                                    >
                                        {rows}x{cols}
                                    </button>
                                ))
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Table Actions Menu - Only visible when table is active */}
            {isTableActive && (
                <div className="relative" ref={tableActionsMenuRef}>
                    <button 
                        type="button"
                        onClick={() => setShowTableActionsMenu(!showTableActionsMenu)}
                        className="p-2 rounded hover:bg-gray-100 text-red-600 bg-red-50"
                        title="टेबल कार्रवाई (Table Actions)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                    
                    {/* Table Actions Dropdown Menu */}
                    {showTableActionsMenu && (
                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[220px] z-20">
                            <div className="space-y-1">
                                <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-2">टेबल कार्रवाई (Table Actions)</div>
                                
                                {/* Column Actions */}
                                <div className="text-xs font-medium text-gray-600 px-2 py-1">कॉलम (Columns)</div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        editor.chain().focus().addColumnBefore().run();
                                        setShowTableActionsMenu(false);
                                    }}
                                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded"
                                >
                                    ➕ पहले कॉलम जोड़ें
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        editor.chain().focus().addColumnAfter().run();
                                        setShowTableActionsMenu(false);
                                    }}
                                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded"
                                >
                                    ➕ बाद में कॉलम जोड़ें
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setShowTableActionsMenu(false);
                                        const confirmed = await showConfirm({
                                            message: 'क्या आप वाकई इस कॉलम को हटाना चाहते हैं?',
                                            type: 'danger'
                                        });
                                        if (confirmed) {
                                            editor.chain().focus().deleteColumn().run();
                                        }
                                    }}
                                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-red-50 rounded text-red-600 font-medium"
                                >
                                    🗑️ कॉलम हटाएं
                                </button>
                                
                                <div className="border-t border-gray-200 my-1"></div>
                                
                                {/* Row Actions */}
                                <div className="text-xs font-medium text-gray-600 px-2 py-1">पंक्ति (Rows)</div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        editor.chain().focus().addRowBefore().run();
                                        setShowTableActionsMenu(false);
                                    }}
                                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded"
                                >
                                    ➕ पहले पंक्ति जोड़ें
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        editor.chain().focus().addRowAfter().run();
                                        setShowTableActionsMenu(false);
                                    }}
                                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-100 rounded"
                                >
                                    ➕ बाद में पंक्ति जोड़ें
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setShowTableActionsMenu(false);
                                        const confirmed = await showConfirm({
                                            message: 'क्या आप वाकई इस पंक्ति को हटाना चाहते हैं?',
                                            type: 'danger'
                                        });
                                        if (confirmed) {
                                            editor.chain().focus().deleteRow().run();
                                        }
                                    }}
                                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-red-50 rounded text-red-600 font-medium"
                                >
                                    🗑️ पंक्ति हटाएं
                                </button>
                                
                                <div className="border-t border-red-200 my-2"></div>
                                
                                {/* Delete Table */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (window.confirm('क्या आप वाकई इस पूरी टेबल को हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।')) {
                                            editor.chain().focus().deleteTable().run();
                                        }
                                        setShowTableActionsMenu(false);
                                    }}
                                    className="w-full text-left px-2 py-2 text-sm hover:bg-red-100 rounded text-red-600 font-bold border border-red-300 bg-red-50"
                                >
                                    🗑️ पूरी टेबल हटाएं
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

            {/* Text Alignment */}
            <button 
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()} 
                className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'left' }) ? 'text-red-600 bg-red-50' : ''}`}
                title="Left Align"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 6h18M3 18h18" />
                </svg>
            </button>
            <button 
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()} 
                className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'center' }) ? 'text-red-600 bg-red-50' : ''}`}
                title="Center Align"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M6 14h12M9 6h6M9 18h6" />
                </svg>
            </button>
            <button 
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()} 
                className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'right' }) ? 'text-red-600 bg-red-50' : ''}`}
                title="Right Align"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H3M21 14H3M21 6H3M21 18H3" />
                </svg>
            </button>
            <button 
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('justify').run()} 
                className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'justify' }) ? 'text-red-600 bg-red-50' : ''}`}
                title="Justify"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 6h18M3 18h18" />
                </svg>
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

            {/* Link Button for Text */}
            <button 
                type="button"
                onClick={() => {
                    const previousUrl = editor.getAttributes('link').href;
                    
                    // If text is selected, apply/remove link
                    if (!editor.state.selection.empty) {
                        if (editor.isActive('link')) {
                            // Remove link if already linked
                            editor.chain().focus().extendMarkRange('link').unsetLink().run();
                        } else {
                            // Add link to selected text
                            const url = window.prompt('URL दर्ज करें:', previousUrl || '');
                            if (url === null || url === '') return;
                            
                            // Silently reject localhost links
                            if (url.includes('localhost') || url.startsWith('http://localhost') || url.startsWith('https://localhost')) {
                                return;
                            }
                            
                            editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();
                        }
                    } else {
                        // If no text selected, ask for link text and URL
                        const linkText = window.prompt('Link का text दर्ज करें:', '');
                        if (linkText === null || linkText === '') return;
                        
                        const url = window.prompt('URL दर्ज करें:', previousUrl || '');
                        if (url === null || url === '') return;
                        
                        // Silently reject localhost links
                        if (url.includes('localhost') || url.startsWith('http://localhost') || url.startsWith('https://localhost')) {
                            return;
                        }
                        
                        // Insert link with text
                        editor.chain().focus().insertContent(`<a href="${url}" target="_blank">${linkText}</a>`).run();
                    }
                }}
                className={`p-2 rounded text-sm transition-all ${
                    editor.isActive('link') 
                        ? 'text-red-600 bg-red-50' 
                        : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="Text में Link जोड़ें/हटाएं"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

            {/* Preview Toggle */}
            <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`p-2 rounded hover:bg-gray-100 ${showPreview ? 'text-blue-600 bg-blue-50' : ''}`}
                title="Preview (प्रिव्यू)"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            </button>


        </div>
    );
};

const TipTapEditor = ({ content = '', onChange, placeholder = 'यहाँ लिखना शुरू करें...' }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const { confirmDialog, showConfirm } = useConfirm();

    // Function to strip color styles from HTML content
    const stripColorStyles = (html) => {
        if (!html || typeof html !== 'string') return html;

        return html
            .replace(/color:\s*[^;]+;?/gi, '')
            .replace(/background-color:\s*[^;]+;?/gi, '')
            .replace(/style="[^"]*color:[^"]*"[^>]*>/gi, '>')
            .replace(/style="[^"]*background-color:[^"]*"[^>]*>/gi, '>');
    };

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Exclude Link and Underline from StarterKit since we're adding them separately
                link: false,
                underline: false,
            }),
            Underline,
            CustomImageExtension.configure({ inline: true, allowBase64: true }),
            VideoExtension, // Add Custom Video Extension
            Youtube.configure({ controls: false }),
            Link.configure({ 
                openOnClick: true,
                HTMLAttributes: {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                },
            }),
            TextStyle,
            Highlight,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder }),
            // Table extensions
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse border border-gray-300 w-full my-4',
                },
            }),
            TableRow.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300',
                },
            }),
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 bg-gray-100 px-4 py-2 font-semibold',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 px-4 py-2',
                },
            }),
            // BubbleMenuExtension.configure({
            //    pluginKey: 'bubbleMenu', 
            // }),
        ],
        content,
        // onUpdate: Updates local state only, does NOT save to backend
        // Content is only saved when admin clicks "अपडेट करें" button
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onFocus: () => setIsFocused(true),
        onBlur: ({ editor }) => {
            setIsFocused(false);
            // Ensure content is captured in local state when editor loses focus
            // This does NOT save to backend - only updates formData state
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'min-h-[300px] p-4 focus:outline-none tiptap-content',
                // Ensure copy-paste works properly
                contentEditable: true,
                // Allow paste events
                onpaste: (e) => {
                    // Let the TipTap handlePaste function manage this
                    return true;
                },
                oncopy: (e) => {
                    return true;
                },
                oncut: (e) => {
                    return true;
                },
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
                    const file = event.dataTransfer.files[0];

                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const { schema } = view.state;
                            const node = schema.nodes.image.create({ src: e.target.result });
                            const transaction = view.state.tr.replaceSelectionWith(node);
                            view.dispatch(transaction);
                        };
                        reader.readAsDataURL(file);
                        return true;
                    }

                    if (file.type.startsWith('video/')) {
                        const url = URL.createObjectURL(file);
                        const { schema } = view.state;
                        // Use the video node defined in VideoExtension
                        const node = schema.nodes.video.create({ src: url });
                        const transaction = view.state.tr.replaceSelectionWith(node);
                        view.dispatch(transaction);
                        return true;
                    }
                }
                return false;
            },
            // Allow normal copy-paste functionality
            handlePaste: (view, event, slice) => {
                // For simple text paste, let TipTap handle it normally
                const pastedText = event.clipboardData?.getData('text/plain');
                const pastedHtml = event.clipboardData?.getData('text/html');

                // If it's just plain text, let default handling work
                if (pastedText && !pastedHtml) {
                    return false; // Use default TipTap paste handling
                }

                // If it's HTML content, clean it but don't interfere with basic pasting
                if (pastedHtml) {
                    // Only clean if it contains color styles, otherwise let it pass through
                    if (pastedHtml.includes('color:') || pastedHtml.includes('background-color:')) {
                        // Strip color and background-color styles
                        const cleanedHtml = pastedHtml
                            .replace(/color:\s*[^;]+;?/gi, '')
                            .replace(/background-color:\s*[^;]+;?/gi, '')
                            .replace(/style="[^"]*color:[^"]*"[^>]*>/gi, '>')
                            .replace(/style="[^"]*background-color:[^"]*"[^>]*>/gi, '>');

                        // Replace the clipboard data with cleaned HTML
                        const cleanedData = new DataTransfer();
                        cleanedData.setData('text/html', cleanedHtml);
                        cleanedData.setData('text/plain', event.clipboardData.getData('text/plain'));

                        // Create a new paste event with cleaned data
                        const newEvent = new ClipboardEvent('paste', {
                            clipboardData: cleanedData,
                            bubbles: true,
                            cancelable: true
                        });

                        // Dispatch the cleaned paste event
                        view.dom.dispatchEvent(newEvent);
                        return true; // Prevent default handling
                    }
                }

                // For all other cases, use default TipTap paste handling
                return false;
            }
        }
    });

    // Update content if it changes externally (only on initial load or when content prop changes significantly)
    useEffect(() => {
        if (editor && content !== undefined) {
            const currentContent = editor.getHTML();
            // Strip color styles from incoming content
            const cleanContent = stripColorStyles(content);
            // Only update if content is significantly different (to avoid infinite loops)
            // Update on initial load or when content prop is explicitly changed from parent
            if (editor.isEmpty || (cleanContent && currentContent !== cleanContent && cleanContent.trim() !== '')) {
                editor.commands.setContent(cleanContent, false); // false = don't add to history
            }
        }
    }, [content, editor]);

    return (
        <>
            {confirmDialog && (
                <ConfirmDialog
                    isOpen={!!confirmDialog}
                    message={confirmDialog.message}
                    type={confirmDialog.type}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={confirmDialog.onCancel}
                />
            )}
            <div className={`border rounded-xl bg-white overflow-hidden transition-all duration-200 ${isFocused ? 'ring-2 ring-[#E21E26] border-[#E21E26]' : 'border-gray-300 hover:border-gray-400'}`} style={{ userSelect: 'text', WebkitUserSelect: 'text' }}>

            {/* Custom Styles Injection */}
            <style>{`
          /* Ensure copy-paste works */
          .tiptap-content {
            user-select: text;
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
          }

          .tiptap-content h1 { font-size: 2.25em; font-weight: 800; margin-bottom: 0.5em; line-height: 1.2; }
          .tiptap-content h2 { font-size: 1.75em; font-weight: 700; margin-bottom: 0.5em; margin-top: 1em; line-height: 1.3; }
          .tiptap-content h3 { font-size: 1.5em; font-weight: 600; margin-bottom: 0.5em; margin-top: 1em; }
          .tiptap-content p { margin-bottom: 1em; line-height: 1.6; }
          .tiptap-content ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
          .tiptap-content ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
          .tiptap-content blockquote { border-left: 4px solid #E5E7EB; padding-left: 1em; margin-left: 0; color: #6B7280; font-style: italic; }
          .tiptap-content a { color: #2563eb; text-decoration: underline; }
          .tiptap-content a:hover { color: #1d4ed8; }
          .tiptap-content img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1em 0; }
          .tiptap-content video { max-width: 100%; border-radius: 0.5rem; margin: 1em 0; }
          .tiptap-content img[data-align="left"], .tiptap-content video[data-align="left"] { display: block; margin-left: 0; margin-right: auto; }
          .tiptap-content img[data-align="center"], .tiptap-content video[data-align="center"] { display: block; margin-left: auto; margin-right: auto; }
          .tiptap-content img[data-align="right"], .tiptap-content video[data-align="right"] { display: block; margin-left: auto; margin-right: 0; }
          .tiptap-content blockquote { border-left: 4px solid #E5E7EB; padding-left: 1em; margin-left: 0; color: #6B7280; font-style: italic; margin: 1em 0; }
          .tiptap-content table { border-collapse: collapse; width: 100%; margin: 1em 0; }
          .tiptap-content table td, .tiptap-content table th { border: 1px solid #D1D5DB; padding: 0.5em; }
          .tiptap-content table th { background-color: #F3F4F6; font-weight: 600; }
          .tiptap-content table tr:nth-child(even) { background-color: #F9FAFB; } 
          
          /* Preview Styles - Match User News Page */
          .news-content-preview h1 { font-size: 1.875rem; font-weight: 700; margin-bottom: 1rem; margin-top: 1.5rem; line-height: 1.3; color: #111827; }
          .news-content-preview h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; margin-top: 1.25rem; line-height: 1.4; color: #111827; }
          .news-content-preview h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.75rem; margin-top: 1rem; line-height: 1.4; color: #111827; }
          .news-content-preview h4 { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; margin-top: 0.75rem; line-height: 1.4; color: #111827; }
          .news-content-preview p { margin-bottom: 1rem; line-height: 1.8; color: #1f2937; font-size: 1rem; }
          .news-content-preview ul, .news-content-preview ol { margin-bottom: 1rem; padding-left: 1.5rem; line-height: 1.8; }
          .news-content-preview ul { list-style-type: disc; }
          .news-content-preview ol { list-style-type: decimal; }
          .news-content-preview li { margin-bottom: 0.5rem; color: #1f2937; }
          .news-content-preview blockquote { border-left: 4px solid #E5E7EB; padding-left: 1rem; margin-left: 0; margin: 1rem 0; color: #4b5563; font-style: italic; background-color: #f9fafb; padding: 1rem; border-radius: 0.25rem; }
          .news-content-preview a { color: #2563eb; text-decoration: underline; }
          .news-content-preview a:hover { color: #1d4ed8; }
          .news-content-preview img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1.5rem 0; border: 1px solid #e5e7eb; }
          .news-content-preview video { max-width: 100%; border-radius: 0.5rem; margin: 1.5rem 0; border: 1px solid #e5e7eb; }
          .news-content-preview img[data-align="left"], .news-content-preview video[data-align="left"] { display: block; margin-left: 0; margin-right: auto; }
          .news-content-preview img[data-align="center"], .news-content-preview video[data-align="center"] { display: block; margin-left: auto; margin-right: auto; }
          .news-content-preview img[data-align="right"], .news-content-preview video[data-align="right"] { display: block; margin-left: auto; margin-right: 0; }
          .news-content-preview table { border-collapse: collapse; width: 100%; margin: 1.5rem 0; border: 1px solid #d1d5db; border-radius: 0.5rem; overflow: hidden; }
          .news-content-preview table td, .news-content-preview table th { border: 1px solid #d1d5db; padding: 0.75rem; }
          .news-content-preview table th { background-color: #f3f4f6; font-weight: 600; }
          .news-content-preview table tr:nth-child(even) { background-color: #f9fafb; }
          .news-content-preview strong { font-weight: 600; color: #111827; }
          .news-content-preview em { font-style: italic; }
          .news-content-preview u { text-decoration: underline; }
          .news-content-preview code { background-color: #f3f4f6; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875em; }
          .news-content-preview pre { background-color: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1rem 0; }
          .news-content-preview pre code { background-color: transparent; color: inherit; padding: 0; }
          
          /* Bubble Menu Styles */
          .bubble-menu {
             display: flex;
             background-color: #333;
             padding: 0.2rem;
             border-radius: 0.5rem;
             box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .bubble-menu button {
             color: white;
             padding: 0.3rem 0.5rem;
             background: none;
             border: none;
             border-radius: 0.3rem;
             font-size: 0.875rem;
             cursor: pointer;
             transition: background-color 0.2s;
          }
          .bubble-menu button:hover {
             background-color: #555;
          }
          .bubble-menu button.is-active {
             background-color: #E21E26;
          }
          .bubble-menu .divider {
             width: 1px;
             background-color: #555;
             margin: 0 0.2rem;
          }
        `}</style>

            <MenuBar editor={editor} showConfirm={showConfirm} showPreview={showPreview} setShowPreview={setShowPreview} />

            {/* Floating Bubble Menu - Temporarily disabled due to import issues
            {editor && (
                <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
                    <div className="bubble-menu">
                        <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'is-active' : ''}>Bold</button>
                        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'is-active' : ''}>Italic</button>
                        <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'is-active' : ''}>Strike</button>
                        <div className="divider"></div>
                        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}>H1</button>
                        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}>H2</button>
                        <div className="divider"></div>
                        <button onClick={() => {
                            const url = window.prompt('URL');
                            if (url) editor.chain().focus().setLink({ href: url }).run();
                        }} className={editor.isActive('link') ? 'is-active' : ''}>Link</button>
                    </div>
                </BubbleMenu>
            )}
            */}

            {showPreview ? (
                <div className="bg-white min-h-[300px] p-4 sm:p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-4 pb-3 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">Preview (प्रिव्यू) - यह आपके समाचार पेज पर कैसा दिखेगा:</h3>
                        </div>
                        <div 
                            className="prose prose-sm sm:prose-base max-w-none news-content-preview"
                            dangerouslySetInnerHTML={{ __html: editor?.getHTML() || content }}
                            style={{
                                lineHeight: '1.8',
                                fontSize: '16px',
                                color: '#1f2937'
                            }}
                        />
                    </div>
                </div>
            ) : (
                <>
                    <EditorContent editor={editor} className="bg-white min-h-[300px]" />
                    <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-xs text-cool-gray-500 flex justify-between">
                        <span>{editor?.storage.characterCount?.words?.() || 0} शब्द</span>
                        <span>{editor?.isDirty ? 'Draft' : 'Ready'}</span>
                    </div>
                </>
            )}
        </div>
        </>
    );
};

export default TipTapEditor;
