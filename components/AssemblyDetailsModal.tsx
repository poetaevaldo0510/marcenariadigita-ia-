import React, { useState, useEffect } from 'react';
import { Spinner, SparklesIcon, ToolsIcon, CopyIcon, CheckIcon } from './Shared';
import { convertMarkdownToHtml } from '../utils/helpers';
import type { ProjectHistoryItem } from '../types';

interface AssemblyDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    showAlert: (message: string, title?: string) => void;
    project: ProjectHistoryItem;
    assemblyDetails: string | null;
    isGenerating: boolean;
    onGenerate: () => void;
    onSave: (details: string) => void;
}

export const AssemblyDetailsModal: React.FC<AssemblyDetailsModalProps> = ({ isOpen, onClose, showAlert, project, assemblyDetails, isGenerating, onGenerate, onSave }) => {
    const [displayedDetails, setDisplayedDetails] = useState<string | null>(null);
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // If assemblyDetails are provided via prop, use them, otherwise check project.assemblyDetails
            setDisplayedDetails(assemblyDetails || project.assemblyDetails || null);
            setIsSaved(!!project.assemblyDetails && project.assemblyDetails === assemblyDetails); // Check if current generated is same as saved
            setCopyFeedback(null);

            // If no details are available and not currently generating, trigger generation
            if (!assemblyDetails && !project.assemblyDetails && !isGenerating) {
                onGenerate();
            }
        }
    }, [isOpen, project.assemblyDetails, assemblyDetails, isGenerating, onGenerate]);

    useEffect(() => {
        // Update isSaved state whenever displayedDetails changes
        setIsSaved(!!displayedDetails && displayedDetails === project.assemblyDetails);
    }, [displayedDetails, project.assemblyDetails]);


    const handleCopyDetails = () => {
        if (displayedDetails) {
            navigator.clipboard.writeText(displayedDetails);
            setCopyFeedback('Copiado!');
            setTimeout(() => setCopyFeedback(null), 2000);
        }
    };

    const handleSave = () => {
        if (displayedDetails) {
            onSave(displayedDetails);
            setIsSaved(true);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div
                className="bg-[#fffefb] dark:bg-[#4a4040] rounded-lg w-full max-w-4xl max-h-[90vh] shadow-xl border border-[#e6ddcd] dark:border-[#4a4040] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-[#e6ddcd] dark:border-[#4a4040] flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#b99256] dark:text-[#d4ac6e] flex items-center gap-2">
                        <ToolsIcon /> Instruções de Montagem
                    </h2>
                    <button onClick={onClose} className="text-[#a89d8d] hover:text-[#3e3535] dark:hover:text-white text-2xl">&times;</button>
                </header>

                <main className="p-4 flex-grow overflow-y-auto">
                    <div className="mb-4 bg-[#f0e9dc] dark:bg-[#2d2424] p-4 rounded-lg">
                        <h3 className="font-semibold text-[#3e3535] dark:text-[#f5f1e8]">Projeto: {project.name}</h3>
                        <p className="text-sm text-[#6a5f5f] dark:text-[#c7bca9] line-clamp-2">{project.description}</p>
                    </div>

                    <button
                        onClick={onGenerate}
                        disabled={isGenerating || !project.bom}
                        className="w-full bg-[#d4ac6e] hover:bg-[#c89f5e] text-[#3e3535] font-bold py-3 px-5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mb-6"
                    >
                        {isGenerating ? <Spinner size="sm" /> : <SparklesIcon />}
                        <span>{isGenerating ? 'Gerando Instruções...' : 'Gerar/Regerar Instruções'}</span>
                    </button>

                    {displayedDetails && (
                        <div className="bg-[#f0e9dc] dark:bg-[#2d2424] p-4 rounded-lg border border-[#e6ddcd] dark:border-[#4a4040] relative animate-fadeIn">
                            <h3 className="text-lg font-semibold text-[#6a5f5f] dark:text-[#c7bca9] mb-3">Instruções Geradas:</h3>
                            <button
                                onClick={handleCopyDetails}
                                className="absolute top-4 right-4 bg-[#e6ddcd] dark:bg-[#5a4f4f] p-2 rounded-md text-[#6a5f5f] dark:text-[#c7bca9] hover:bg-[#dcd6c8] dark:hover:bg-[#4a4040] transition flex items-center gap-1 text-sm"
                                title="Copiar Instruções"
                            >
                                {copyFeedback ? <><CheckIcon className="w-4 h-4 text-green-500" /> {copyFeedback}</> : <><CopyIcon /> Copiar</>}
                            </button>
                            <div className="prose prose-sm dark:prose-invert max-w-none mt-10" dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(displayedDetails) }} />
                        </div>
                    )}
                    {isGenerating && (
                        <div className="text-center p-8">
                            <Spinner />
                            <p className="mt-2 text-[#8a7e7e] dark:text-[#a89d8d]">A Iara está detalhando os passos de montagem...</p>
                        </div>
                    )}
                    {!isGenerating && !displayedDetails && project.bom && (
                        <div className="text-center p-8 text-[#8a7e7e] dark:text-[#a89d8d]">
                            <p>Clique em "Gerar Instruções" para que a Iara crie o passo a passo de montagem com base na BOM.</p>
                        </div>
                    )}
                     {!project.bom && !isGenerating && (
                        <div className="text-center p-8 text-red-500 dark:text-red-400">
                            <p>Por favor, gere a Lista de Materiais (BOM) do projeto primeiro.</p>
                        </div>
                    )}
                </main>
                <footer className="p-4 border-t border-[#e6ddcd] dark:border-[#4a4040] flex justify-end flex-shrink-0 gap-4">
                    <button onClick={onClose} className="bg-[#8a7e7e] dark:bg-[#5a4f4f] text-white font-bold py-2 px-4 rounded hover:bg-[#6a5f5f] dark:hover:bg-[#4a4040] transition">
                        Fechar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isGenerating || !displayedDetails || isSaved}
                        className="bg-[#3e3535] dark:bg-[#d4ac6e] text-white dark:text-[#3e3535] font-bold py-2 px-4 rounded hover:bg-[#2d2424] dark:hover:bg-[#c89f5e] transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaved ? <CheckIcon /> : <SparklesIcon />}
                        {isSaved ? 'Salvo no Projeto' : 'Salvar no Projeto'}
                    </button>
                </footer>
            </div>
        </div>
    );
};