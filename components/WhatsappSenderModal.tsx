import React, { useState, useEffect } from 'react';
import type { ProjectHistoryItem, Client } from '../types';
import { WhatsappIcon } from './Shared';

interface WhatsappSenderModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: ProjectHistoryItem | null;
    // Removed 'client' prop
    showAlert: (message: string, title?: string) => void;
}

export const WhatsappSenderModal: React.FC<WhatsappSenderModalProps> = ({ isOpen, onClose, project, showAlert }) => {
    const [message, setMessage] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (isOpen && project) {
            setMessage(`Olá, ${project.endClientName || 'cliente'}! Segue a proposta para o projeto "${project.name}". Por favor, revise e me avise se tiver alguma dúvida. Tenha um ótimo dia!`);
            setPhone(project.endClientPhone || '');
        }
    }, [project, isOpen]);

    if (!isOpen || !project) return null; // Removed client from this check

    const handleSend = () => {
        if (!phone.trim()) {
            showAlert("Por favor, insira um número de telefone válido.", "Telefone Necessário");
            return;
        }
        const encodedMessage = encodeURIComponent(message);
        const formattedPhone = phone.replace(/\D/g, '');
        
        // Simple check for Brazil country code, assumes DDI is provided if length is > 11
        if (formattedPhone.length <= 11 && !formattedPhone.startsWith('55')) {
            const url = `https://wa.me/55${formattedPhone}?text=${encodedMessage}`;
            window.open(url, '_blank');
        } else {
             const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
             window.open(url, '_blank');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div 
                className="bg-[#fffefb] dark:bg-[#4a4040] rounded-lg w-full max-w-lg shadow-xl border border-[#e6ddcd] dark:border-[#4a4040] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-[#e6ddcd] dark:border-[#4a4040] flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#b99256] dark:text-[#d4ac6e] flex items-center gap-2">
                        <WhatsappIcon /> Enviar Proposta via WhatsApp
                    </h2>
                    <button onClick={onClose} className="text-[#a89d8d] hover:text-[#3e3535] dark:hover:text-white text-2xl">&times;</button>
                </header>

                <main className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#6a5f5f] dark:text-[#c7bca9]">Cliente</label>
                        <input type="text" value={project.endClientName || 'Não especificado'} readOnly className="w-full bg-[#f0e9dc] dark:bg-[#2d2424] p-2 mt-1 rounded-lg border border-[#dcd6c8] dark:border-[#5a4f4f] opacity-70" />
                    </div>
                     <div>
                        <label htmlFor="whatsapp-phone" className="block text-sm font-medium text-[#6a5f5f] dark:text-[#c7bca9]">Telefone (incluir código do país, ex: 55119...)</label>
                        <input 
                            id="whatsapp-phone"
                            type="tel" 
                            value={phone} 
                            onChange={e => setPhone(e.target.value)} 
                            placeholder="5511999999999"
                            className="w-full bg-[#f0e9dc] dark:bg-[#2d2424] p-2 mt-1 rounded-lg border border-[#dcd6c8] dark:border-[#5a4f4f] focus:ring-[#d4ac6e] focus:border-[#d4ac6e]" />
                    </div>
                     <div>
                        <label htmlFor="whatsapp-message" className="block text-sm font-medium text-[#6a5f5f] dark:text-[#c7bca9]">Mensagem</label>
                        <textarea
                            id="whatsapp-message"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={5}
                            className="w-full bg-[#f0e9dc] dark:bg-[#2d2424] p-2 mt-1 rounded-lg border border-[#dcd6c8] dark:border-[#5a4f4f] focus:ring-[#d4ac6e] focus:border-[#d4ac6e]"
                        />
                    </div>
                </main>

                <footer className="p-4 border-t border-[#e6ddcd] dark:border-[#4a4040] flex justify-end gap-4">
                    <button onClick={onClose} className="bg-[#8a7e7e] dark:bg-[#5a4f4f] text-white font-bold py-2 px-4 rounded hover:bg-[#6a5f5f] dark:hover:bg-[#4a4040] transition">
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSend}
                        className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                        <WhatsappIcon className="w-5 h-5"/> Enviar no WhatsApp
                    </button>
                </footer>
            </div>
        </div>
    );
};