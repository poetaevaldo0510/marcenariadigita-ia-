import React, { useState, useEffect } from 'react';
import type { UserPerformance } from '../types';
import { getUserPerformance } from '../services/geminiService';
import { Spinner, TrophyIcon, BoltIcon, RulerIcon, HeartIcon } from './Shared';

interface PerformanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail: string;
    showAlert: (message: string, title?: string) => void;
}

const badgeIcons: { [key: string]: React.FC<{className?: string}> } = {
    'bolt': BoltIcon,
    'ruler': RulerIcon,
    'heart': HeartIcon,
    'default': TrophyIcon,
};

export const PerformanceModal: React.FC<PerformanceModalProps> = ({ isOpen, onClose, userEmail, showAlert }) => {
    const [performanceData, setPerformanceData] = useState<UserPerformance | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const data = await getUserPerformance(userEmail);
                    setPerformanceData(data);
                } catch (error) {
                    showAlert(error instanceof Error ? error.message : 'Erro ao buscar dados de desempenho.', 'Erro');
                    onClose();
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [isOpen, userEmail, showAlert, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div 
                className="bg-[#fffefb] dark:bg-[#4a4040] rounded-lg w-full max-w-2xl max-h-[90vh] shadow-xl border border-[#e6ddcd] dark:border-[#4a4040] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-[#e6ddcd] dark:border-[#4a4040] flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#b99256] dark:text-[#d4ac6e] flex items-center gap-2">
                        <TrophyIcon /> Meu Desempenho no EncontraPro
                    </h2>
                    <button onClick={onClose} className="text-[#a89d8d] hover:text-[#3e3535] dark:hover:text-white text-2xl">&times;</button>
                </header>

                <main className="p-6 flex-grow overflow-y-auto">
                    {isLoading || !performanceData ? (
                        <div className="flex justify-center items-center h-full">
                            <Spinner />
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Level and Points Section */}
                            <div className="text-center">
                                <p className="text-sm font-semibold text-[#8a7e7e] dark:text-[#a89d8d] uppercase">Nível</p>
                                <p className="text-7xl font-bold text-[#3e3535] dark:text-[#f5f1e8]">{performanceData.level}</p>
                                <div className="w-full bg-[#e6ddcd] dark:bg-[#3e3535] rounded-full h-4 my-3">
                                    <div 
                                        className="bg-gradient-to-r from-[#b99256] to-[#d4ac6e] h-4 rounded-full" 
                                        style={{ width: `${performanceData.progress}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-[#6a5f5f] dark:text-[#c7bca9]">
                                    <strong>{performanceData.points} / {performanceData.nextLevelPoints}</strong> pontos para o próximo nível
                                </p>
                            </div>
                            
                            {/* Achievements Section */}
                            <div>
                                <h3 className="text-xl font-bold font-serif text-[#3e3535] dark:text-[#f5f1e8] mb-4">Conquistas Desbloqueadas</h3>
                                {performanceData.achievements.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {performanceData.achievements.map(ach => {
                                            const Icon = badgeIcons[ach.icon] || badgeIcons['default'];
                                            return (
                                                <div key={ach.id} className="bg-[#f0e9dc] dark:bg-[#3e3535] p-4 rounded-lg text-center border border-[#e6ddcd] dark:border-[#5a4f4f]">
                                                    <div className="inline-block p-3 bg-white dark:bg-[#4a4040] rounded-full mb-2 text-[#b99256] dark:text-[#d4ac6e]">
                                                        <Icon className="w-8 h-8"/>
                                                    </div>
                                                    <p className="font-bold text-[#3e3535] dark:text-[#f5f1e8]">{ach.name}</p>
                                                    <p className="text-xs text-[#6a5f5f] dark:text-[#c7bca9] mt-1">{ach.description}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-center text-[#8a7e7e] dark:text-[#a89d8d] p-6 bg-[#f0e9dc] dark:bg-[#3e3535] rounded-lg">
                                        Continue criando projetos incríveis para desbloquear suas primeiras conquistas!
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </main>
                <footer className="p-4 border-t border-[#e6ddcd] dark:border-[#4a4040] flex justify-end flex-shrink-0">
                    <button onClick={onClose} className="bg-[#8a7e7e] dark:bg-[#5a4f4f] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#6a5f5f] dark:hover:bg-[#4a4040] transition">
                        Fechar
                    </button>
                </footer>
            </div>
        </div>
    );
};