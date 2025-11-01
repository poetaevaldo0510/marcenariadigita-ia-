import React, { useState } from 'react';
import type { ProjectLead } from '../types';
import { findProjectLeads } from '../services/geminiService';
import { Spinner, ProIcon, SearchIcon, CurrencyDollarIcon, CheckIcon } from './Shared';

interface EncontraProModalProps {
    isOpen: boolean;
    onClose: () => void;
    showAlert: (message: string, title?: string) => void;
}

const EarlyAccessForm: React.FC<{}> = () => {
    const [form, setForm] = useState({ nome: '', email: '', cidade: '' });
    const [msg, setMsg] = useState('');

    async function cadastrar(e: React.FormEvent) {
        e.preventDefault();
        // Fazer POST para /api/encontrapro/early-access (simulação)
        console.log('Early access registration:', form);
        setMsg('Cadastro realizado! Você será avisado dos novos clientes primeiro.');
        setTimeout(() => setMsg(''), 5000);
    }

    return (
        <form className="max-w-md mx-auto bg-[#f0e9dc] dark:bg-[#3e3535] rounded-lg shadow p-6 animate-fadeIn" onSubmit={cadastrar}>
            <h2 className="text-xl font-bold mb-3 text-[#3e3535] dark:text-[#f5f1e8]">Acesso Antecipado EncontraPro</h2>
            <p className="text-sm text-[#6a5f5f] dark:text-[#c7bca9] mb-4">Seja o primeiro a saber sobre novos projetos de clientes na sua cidade. Cadastre-se para receber notificações exclusivas.</p>
            <div className="space-y-3">
                <input required placeholder="Seu nome" className="border rounded-lg px-3 py-2 w-full bg-[#fffefb] dark:bg-[#2d2424] border-[#e6ddcd] dark:border-[#5a4f4f] focus:ring-[#d4ac6e]" value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))}/>
                <input required type="email" placeholder="Seu e-mail" className="border rounded-lg px-3 py-2 w-full bg-[#fffefb] dark:bg-[#2d2424] border-[#e6ddcd] dark:border-[#5a4f4f] focus:ring-[#d4ac6e]" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
                <input required placeholder="Sua principal cidade de atuação" className="border rounded-lg px-3 py-2 w-full bg-[#fffefb] dark:bg-[#2d2424] border-[#e6ddcd] dark:border-[#5a4f4f] focus:ring-[#d4ac6e]" value={form.cidade} onChange={e=>setForm(f=>({...f,cidade:e.target.value}))}/>
            </div>
            <button className="bg-[#d4ac6e] hover:bg-[#c89f5e] text-[#3e3535] font-bold py-2 px-4 rounded-lg mt-4 w-full">Quero Acesso Antecipado</button>
            {msg && <div className="mt-3 text-green-600 flex items-center gap-2"><CheckIcon /> {msg}</div>}
        </form>
    );
};

export const EncontraProModal: React.FC<EncontraProModalProps> = ({ isOpen, onClose, showAlert }) => {
    const [city, setCity] = useState('');
    const [leads, setLeads] = useState<ProjectLead[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [view, setView] = useState<'search' | 'early_access'>('search');

    const handleSearch = async () => {
        if (!city.trim()) {
            showAlert('Por favor, digite o nome de uma cidade para buscar.', 'Atenção');
            return;
        }
        setIsLoading(true);
        setHasSearched(true);
        setLeads([]);
        try {
            const results = await findProjectLeads(city);
            setLeads(results);
        } catch (error) {
            showAlert(error instanceof Error ? error.message : 'Erro ao buscar por projetos.', 'Erro');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInterest = (lead: ProjectLead) => {
        showAlert(`Simulação: Interesse demonstrado no projeto "${lead.title}". Em um ambiente real, o cliente seria notificado.`, 'Interesse Registrado');
    };

    if (!isOpen) return null;

    const tabBaseClasses = "px-4 py-2 font-semibold text-sm rounded-t-lg";
    const tabActiveClasses = "bg-[#fffefb] dark:bg-[#4a4040] text-[#b99256] dark:text-[#d4ac6e]";
    const tabInactiveClasses = "bg-transparent text-[#6a5f5f] dark:text-[#c7bca9] hover:bg-[#f0e9dc] dark:hover:bg-[#3e3535]/50";


    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
            <div 
                className="bg-[#f0e9dc] dark:bg-[#3e3535] rounded-lg w-full max-w-4xl max-h-[90vh] shadow-xl border border-[#e6ddcd] dark:border-[#4a4040] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <header className="p-4 border-b border-[#e6ddcd] dark:border-[#4a4040] flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-[#b99256] dark:text-[#d4ac6e] flex items-center gap-2">
                        <ProIcon /> Marketplace EncontraPro
                    </h2>
                    <button onClick={onClose} className="text-[#a89d8d] hover:text-[#3e3535] dark:hover:text-white text-2xl">&times;</button>
                </header>

                <div className="px-4 border-b border-[#e6ddcd] dark:border-[#4a4040]">
                    <nav className="-mb-px flex space-x-4">
                        <button onClick={() => setView('search')} className={`${tabBaseClasses} ${view === 'search' ? tabActiveClasses : tabInactiveClasses}`}>Buscar Projetos</button>
                        <button onClick={() => setView('early_access')} className={`${tabBaseClasses} ${view === 'early_access' ? tabActiveClasses : tabInactiveClasses}`}>Acesso Antecipado</button>
                    </nav>
                </div>
                
                <div className="bg-[#fffefb] dark:bg-[#4a4040] flex-grow overflow-y-auto">
                    {view === 'search' && (
                        <>
                            <div className="p-4 border-b border-[#e6ddcd] dark:border-[#4a4040] flex-shrink-0">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="Digite uma cidade para buscar projetos (Ex: São Paulo)"
                                        className="flex-grow bg-[#f0e9dc] dark:bg-[#2d2424] border-2 border-[#e6ddcd] dark:border-[#4a4040] rounded-lg p-3 text-[#3e3535] dark:text-[#f5f1e8] focus:outline-none focus:ring-2 focus:ring-[#d4ac6e] focus:border-[#d4ac6e] transition"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        disabled={isLoading}
                                        className="bg-[#d4ac6e] hover:bg-[#c89f5e] text-[#3e3535] font-bold py-3 px-5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isLoading ? <Spinner size="sm" /> : <SearchIcon />}
                                        <span>{isLoading ? 'Buscando...' : 'Buscar Projetos'}</span>
                                    </button>
                                </div>
                            </div>
                            <main className="p-4">
                                {isLoading ? (
                                    <div className="text-center p-16">
                                        <Spinner />
                                        <p className="mt-4 text-[#8a7e7e] dark:text-[#a89d8d]">Buscando novos projetos para você...</p>
                                    </div>
                                ) : leads.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {leads.map((lead, index) => (
                                            <div key={lead.id} className="bg-[#f0e9dc] dark:bg-[#3e3535] rounded-lg p-4 border border-[#e6ddcd] dark:border-[#4a4040] flex flex-col justify-between animate-fadeInUp" style={{ animationDelay: `${index * 100}ms`}}>
                                                <div>
                                                    <h3 className="font-bold text-lg text-[#3e3535] dark:text-[#f5f1e8]">{lead.title}</h3>
                                                    <p className="text-sm text-[#8a7e7e] dark:text-[#a89d8d] font-semibold">{lead.location}</p>
                                                    <p className="text-sm my-2 text-[#6a5f5f] dark:text-[#c7bca9]">{lead.description}</p>
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-[#e6ddcd] dark:border-[#4a4040] flex justify-between items-center">
                                                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold">
                                                        <CurrencyDollarIcon />
                                                        <span>{lead.budget}</span>
                                                    </div>
                                                    <button onClick={() => handleInterest(lead)} className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition">
                                                        Demonstrar Interesse
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : hasSearched ? (
                                    <div className="text-center p-16 text-[#8a7e7e] dark:text-[#a89d8d]">
                                        <h3 className="text-xl font-semibold">Nenhum projeto encontrado</h3>
                                        <p>Não encontramos nenhum projeto em "{city}" no momento. Tente outra cidade ou verifique novamente mais tarde.</p>
                                    </div>
                                ) : (
                                    <div className="text-center p-16 text-[#8a7e7e] dark:text-[#a89d8d]">
                                        <h3 className="text-xl font-semibold">Encontre seu Próximo Projeto</h3>
                                        <p>Digite o nome de uma cidade acima para ver os projetos disponíveis na sua região.</p>
                                    </div>
                                )}
                            </main>
                        </>
                    )}
                    {view === 'early_access' && (
                        <div className="p-6">
                            <EarlyAccessForm />
                        </div>
                    )}
                </div>

                <footer className="p-3 border-t bg-[#f0e9dc] dark:bg-[#3e3535] border-[#e6ddcd] dark:border-[#4a4040] flex-shrink-0 text-center">
                    <p className="text-xs text-[#a89d8d]">O EncontraPro é um marketplace para conectar clientes e marceneiros. A negociação é feita diretamente entre as partes.</p>
                </footer>
            </div>
        </div>
    );
};