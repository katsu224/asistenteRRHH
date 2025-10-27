import React, { useRef, useState } from 'react';
import { KnowledgeItem, Bot } from '../types';

declare const pdfjsLib: any;

/**
 * @interface KnowledgeManagerProps
 * @property {KnowledgeItem[]} knowledgeBase - The current list of knowledge items.
 * @property {(item: KnowledgeItem) => void} onAddKnowledge - Callback function to add a new knowledge item.
 * @property {Bot} bot - The currently selected bot.
 */
interface KnowledgeManagerProps {
    knowledgeBase: KnowledgeItem[];
    onAddKnowledge: (item: KnowledgeItem) => void;
    bot: Bot;
}

/**
 * A component that manages the knowledge base of the assistant.
 * It allows users to add text and upload files (images, PDFs) to the knowledge base.
 * @param {KnowledgeManagerProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered knowledge manager component.
 */
const KnowledgeManager: React.FC<KnowledgeManagerProps> = ({ knowledgeBase, onAddKnowledge, bot }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showTextModal, setShowTextModal] = useState(false);
    const [textContent, setTextContent] = useState('');
    const [textName, setTextName] = useState('');
    const [isParsing, setIsParsing] = useState(false);

    /**
     * Handles the change event of the file input.
     * It reads the selected file and adds it to the knowledge base.
     * Supports image and PDF files.
     * @param {React.ChangeEvent<HTMLInputElement>} event - The file input change event.
     */
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                onAddKnowledge({
                    id: crypto.randomUUID(),
                    name: file.name,
                    type: 'image',
                    content: result,
                    mimeType: file.type,
                });
            };
            reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf') {
            setIsParsing(true);
            try {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.mjs';
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
                        const pdf = await pdfjsLib.getDocument(typedArray).promise;
                        let fullText = '';
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const textContent = await page.getTextContent();
                            const pageText = textContent.items.map((item: { str: string }) => item.str).join(' ');
                            fullText += pageText + '\n\n';
                        }
                        onAddKnowledge({
                            id: crypto.randomUUID(),
                            name: file.name,
                            type: 'text', // El contenido del PDF se trata como texto
                            content: fullText.trim(),
                        });
                    } catch (pdfError) {
                        console.error("Error parsing PDF:", pdfError);
                        alert('Hubo un error al leer el archivo PDF.');
                    } finally {
                        setIsParsing(false);
                    }
                };
                reader.onerror = () => {
                    console.error("Error al leer el archivo");
                    alert("Error al leer el archivo.");
                    setIsParsing(false);
                };
                reader.readAsArrayBuffer(file);
            } catch (error) {
                console.error("Error al procesar PDF:", error);
                alert('No se pudo procesar el PDF. Por favor, intenta de nuevo.');
                setIsParsing(false);
            }
        } else {
            alert('Por favor, selecciona un archivo de imagen (JPEG, PNG, WEBP) o un PDF.');
        }
        event.target.value = '';
    };

    /**
     * Handles the addition of a new text-based knowledge item from the modal.
     */
    const handleAddText = () => {
        if (textName.trim() && textContent.trim()) {
            onAddKnowledge({
                id: crypto.randomUUID(),
                name: textName.trim(),
                type: 'text',
                content: textContent.trim(),
            });
            setTextName('');
            setTextContent('');
            setShowTextModal(false);
        }
    };

    /**
     * A simple loading spinner component.
     * @returns {React.ReactElement} The rendered loading spinner.
     */
    const LoadingSpinner = () => (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    /**
     * A reusable button component for the knowledge manager actions.
     * @param {object} props - The props for the component.
     * @param {() => void} props.onClick - The function to call when the button is clicked.
     * @param {React.ReactNode} props.icon - The icon to display in the button.
     * @param {string} props.label - The text label for the button.
     * @param {boolean} [props.disabled] - Whether the button should be disabled.
     * @returns {React.ReactElement} The rendered button component.
     */
    const ActionButton: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string; disabled?: boolean }> = ({ onClick, icon, label, disabled }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
            style={!disabled ? { backgroundColor: bot.themeColor } : {}}
            onMouseOver={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = bot.darkThemeColor; }}
            onMouseOut={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = bot.themeColor; }}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <>
            <aside className="w-80 bg-white dark:bg-gray-800 p-4 flex flex-col border-r border-gray-200 dark:border-gray-700 shadow-lg">
                <h2
                  className="text-lg font-bold mb-4 pb-2 border-b-2"
                  style={{ borderBottomColor: bot.themeColor }}
                >
                  Memoria del Asistente
                </h2>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {knowledgeBase.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">La memoria está vacía. Añade documentos o imágenes.</p>}
                    {knowledgeBase.map(item => (
                        <div key={item.id} className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center space-x-2">
                            <span className="text-lg">{item.type === 'text' ? '📄' : '🖼️'}</span>
                            <span className="text-sm truncate" title={item.name}>{item.name}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t dark:border-gray-600 space-y-3">
                    <ActionButton onClick={() => setShowTextModal(true)} disabled={isParsing} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} label="Añadir Texto" />
                    <ActionButton onClick={() => fileInputRef.current?.click()} disabled={isParsing} icon={isParsing ? <LoadingSpinner /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>} label={isParsing ? "Procesando..." : "Subir Archivo"} />
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp, application/pdf" className="hidden" />
                </div>
            </aside>
            {showTextModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                        <h3 className="text-lg font-bold mb-4">Añadir Conocimiento de Texto</h3>
                        <input type="text" value={textName} onChange={(e) => setTextName(e.target.value)} placeholder="Nombre del documento (ej. 'Política de Vacaciones')" className="w-full p-2 mb-4 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                        <textarea value={textContent} onChange={(e) => setTextContent(e.target.value)} placeholder="Pega aquí el contenido del manual o política..." className="w-full h-40 p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"></textarea>
                        <div className="flex justify-end space-x-4 mt-4">
                            <button onClick={() => setShowTextModal(false)} className="px-4 py-2 rounded text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancelar</button>
                            <button onClick={handleAddText} className="px-4 py-2 rounded text-white" style={{backgroundColor: bot.themeColor}}>Añadir</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default KnowledgeManager;
