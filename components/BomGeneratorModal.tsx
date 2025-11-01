import React, { useState, useEffect } from 'react';
import { generateBom } from '../services/geminiService';
import { Spinner, SparklesIcon, BookIcon, CopyIcon, CheckIcon } from './Shared';
import { convertMarkdownToHtml } from '../utils/helpers';
import type { ProjectHistoryItem } from '../types';

interface BomGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    showAlert: (message: string, title?: string) => void;
    project: ProjectHistoryItem;
    onSave: (bom: string) => void;
}

export const BomGeneratorModal: React.FC<BomGeneratorModalProps> = ({ isOpen, onClose, showAlert, project, onSave }) => {
    const [generatedBom, setGeneratedBom] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setGeneratedBom(project.bom || null);
            setIsLoading(false);
            setCopyFeedback(null);
            setIsSaved(!!project.bom);
        }
    }, [isOpen, project.bom]);


    const handleGenerateBom = async () => {
        setIsLoading(true);
        setGeneratedBom(null);
        setCopyFeedback(null);
        setIsSaved(false);

        try {
            const bomText = await generateBom(project);
            setGeneratedBom(bomText);
        } catch (error) {
            console.error('Error generating BOM:', error);
            showAlert(error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao gerar a BOM.', 'Erro na Geração da BOM');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyBom = () => {
        if (generatedBom) {
            navigator.clipboard.writeText(generatedBom);
            setCopyFeedback('Copiado!');
            setTimeout(() => setCopyFeedback(null), 2000);
        }
    };

    const handleSave = () => {
        if(generatedBom) {
            onSave(generatedBom);
            setIsSaved(true);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div 
                className="bg-[#fffefb] dark:bg-[#4a4040] rounded-lg w-full max-w-4xl max-h-[90vh] shadow-xl border border-[#e6ddcd] dark:border-[#4a4040] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-[#e6ddcd] dark:border-[#4a4040] flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#b99256] dark:text-[#d4ac6e] flex items-center gap-2">
                        <BookIcon /> Gerar Lista de Materiais (BOM)
                    </h2>
                    <button onClick={onClose} className="text-[#a89d8d] hover:text-[#3e3535] dark:hover:text-white text-2xl">&times;</button>
                </header>

                <main className="p-4 flex-grow overflow-y-auto">
                    <div className="mb-4 bg-[#f0e9dc] dark:bg-[#2d2424] p-4 rounded-lg">
                        <h3 className="font-semibold text-[#3e3535] dark:text-[#f5f1e8]">Projeto: {project.name}</h3>
                        <p className="text-sm text-[#6a5f5f] dark:text-[#c7bca9] line-clamp-2">{project.description}</p>
                    </div>

                    <button
                        onClick={handleGenerateBom}
                        disabled={isLoading}
                        className="w-full bg-[#d4ac6e] hover:bg-[#c89f5e] text-[#3e3535] font-bold py-3 px-5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mb-6"
                    >
                        {isLoading ? <Spinner size="sm" /> : <SparklesIcon />}
                        <span>{isLoading ? 'Gerando...' : 'Gerar/Regerar BOM com IA'}</span>
                    </button>

                    {generatedBom && (
                        <div className="bg-[#f0e9dc] dark:bg-[#2d2424] p-4 rounded-lg border border-[#e6ddcd] dark:border-[#4a4040] relative animate-fadeIn">
                             <h3 className="text-lg font-semibold text-[#6a5f5f] dark:text-[#c7bca9] mb-3">Lista de Materiais Gerada:</h3>
                             <button 
                                onClick={handleCopyBom} 
                                className="absolute top-4 right-4 bg-[#e6ddcd] dark:bg-[#5a4f4f] p-2 rounded-md text-[#6a5f5f] dark:text-[#c7bca9] hover:bg-[#dcd6c8] dark:hover:bg-[#4a4040] transition flex items-center gap-1 text-sm"
                                title="Copiar BOM"
                            >
                                {copyFeedback ? <><CheckIcon className="w-4 h-4 text-green-500" /> {copyFeedback}</> : <><CopyIcon /> Copiar</>}
                            </button>
                            <div className="prose prose-sm dark:prose-invert max-w-none mt-10" dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(generatedBom) }} />
                        </div>
                    )}
                     {isLoading && (
                        <div className="text-center p-8">
                            <Spinner />
                            <p className="mt-2 text-[#8a7e7e] dark:text-[#a89d8d]">A Iara está montando sua lista de materiais...</p>
                        </div>
                    )}
                </main>
                <footer className="p-4 border-t border-[#e6ddcd] dark:border-[#4a4040] flex justify-end flex-shrink-0 gap-4">
                     <button onClick={onClose} className="bg-[#8a7e7e] dark:bg-[#5a4f4f] text-white font-bold py-2 px-4 rounded hover:bg-[#6a5f5f] dark:hover:bg-[#4a4040] transition">
                        Fechar
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isLoading || !generatedBom || isSaved}
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