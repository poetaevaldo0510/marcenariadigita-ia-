import React, { useEffect, useState } from 'react';
import { Spinner } from '../components/Shared';

interface Lead {
  id: string;
  nomeCliente: string;
  titulo?: string;
  descricao: string;
  status: string;
  contato: string;
}

interface Marceneiro {
  id: string;
  nome: string;
  cidade: string;
  ativo: boolean;
}

interface Gamificacao {
  id: string;
  marceneiroId: string;
  pontos: number;
  conquistas: string[];
  nivel: number;
}


interface DashboardAdminProps {
    onNavigateBack: () => void;
}

export default function DashboardAdmin({ onNavigateBack }: DashboardAdminProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [marceneiros, setMarceneiros] = useState<Marceneiro[]>([]);
  const [gamificacao, setGamificacao] = useState<Gamificacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            // NOTE: These API endpoints are placeholders. In a real application, they would fetch data from a backend.
            // For this project, we will use mocked data if the fetch fails.
            const [leadsRes, marceneirosRes, gamificacaoRes] = await Promise.all([
                fetch("/api/encontrapro/leads?admin=true").catch(() => ({ ok: false, json: () => Promise.resolve([]) })),
                fetch("/api/encontrapro/marceneiros?admin=true").catch(() => ({ ok: false, json: () => Promise.resolve([]) })),
                fetch("/api/gamification/ranking?admin=true").catch(() => ({ ok: false, json: () => Promise.resolve([]) }))
            ]);

            if (!leadsRes.ok || !marceneirosRes.ok || !gamificacaoRes.ok) {
                 throw new Error('One or more API endpoints failed');
            }
           
            setLeads(await leadsRes.json());
            setMarceneiros(await marceneirosRes.json());
            setGamificacao(await gamificacaoRes.json());
        } catch (error) {
            console.warn("Using mocked data for admin panel as API calls failed:", error);
            setLeads([
                { id: '1', nomeCliente: 'Ana Paula', titulo: 'Cozinha Planejada', descricao: '', status: 'Novo', contato: 'ana.p@example.com' },
                { id: '2', nomeCliente: 'Bruno Lima', titulo: 'Guarda-roupa', descricao: '', status: 'Contatado', contato: 'bruno.l@example.com' }
            ]);
            setMarceneiros([
                { id: 'm1', nome: 'João Silva', cidade: 'São Paulo', ativo: true },
                { id: 'm2', nome: 'Maria Costa', cidade: 'Rio de Janeiro', ativo: false }
            ]);
            setGamificacao([
                { id: 'g1', marceneiroId: 'm1', pontos: 1250, conquistas: ['Projetista Rápido'], nivel: 5 },
                { id: 'g2', marceneiroId: 'm2', pontos: 800, conquistas: [], nivel: 3 }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
  }, []);
  
  const handleToggleMarceneiro = async (marceneiro: Marceneiro) => {
    setMarceneiros(prev => prev.map(m => m.id === marceneiro.id ? { ...m, ativo: !m.ativo } : m));
    try {
        await fetch(`/api/encontrapro/marceneiros/${marceneiro.id}/toggle`, { method: 'POST' });
    } catch (error) {
        console.error("Failed to toggle marceneiro status:", error);
        setMarceneiros(prev => prev.map(m => m.id === marceneiro.id ? { ...m, ativo: !m.ativo } : m));
    }
  };

  const Table: React.FC<{ headers: string[], children: React.ReactNode }> = ({ headers, children }) => (
      <div className="overflow-x-auto">
          <table className="w-full text-left table-auto bg-[#fffefb] dark:bg-[#3e3535] shadow-lg rounded-lg border border-[#e6ddcd] dark:border-[#4a4040]">
              <thead className="bg-[#f0e9dc] dark:bg-[#2d2424]">
                  <tr>
                      {headers.map(h => <th key={h} className="p-4 font-semibold uppercase text-sm text-[#6a5f5f] dark:text-[#c7bca9]">{h}</th>)}
                  </tr>
              </thead>
              <tbody className="divide-y divide-[#e6ddcd] dark:divide-[#4a4040]">
                  {children}
              </tbody>
          </table>
      </div>
  );

  const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <tr className="hover:bg-[#f0e9dc]/50 dark:hover:bg-[#2d2424]/50 transition-colors">
          {children}
      </tr>
  );

  const TableCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <td className="p-4 text-[#3e3535] dark:text-[#f5f1e8] align-top">{children}</td>
  );


  if (isLoading) {
      return (
          <div className="flex justify-center items-center h-screen">
              <Spinner size="lg" />
          </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fadeIn">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-serif text-[#3e3535] dark:text-[#f5f1e8]">Painel Administrativo – EncontraPro</h1>
          <button
            onClick={onNavigateBack}
            className="bg-[#3e3535] dark:bg-[#d4ac6e] text-white dark:text-[#3e3535] font-bold py-2 px-4 rounded-lg hover:bg-[#2d2424] dark:hover:bg-[#c89f5e] transition"
          >
            &larr; Voltar para o App
          </button>
      </div>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold font-serif text-[#6a5f5f] dark:text-[#c7bca9] mb-4">Novos Leads</h2>
        <Table headers={['Cliente', 'Projeto', 'Status', 'Contatar']}>
            {leads.map(l=>(
              <TableRow key={l.id}>
                <TableCell>{l.nomeCliente}</TableCell>
                <TableCell>{l.titulo || l.descricao}</TableCell>
                <TableCell>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                        {l.status}
                    </span>
                </TableCell>
                <TableCell>
                    <a href={`mailto:${l.contato}`} className="text-amber-600 dark:text-amber-400 hover:underline">Email</a>
                </TableCell>
              </TableRow>
            ))}
        </Table>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold font-serif text-[#6a5f5f] dark:text-[#c7bca9] mb-4">Ranking e Gamificação</h2>
        <Table headers={['Marceneiro', 'Pontos', 'Badges', 'Nível']}>
            {gamificacao.map(g=>(
              <TableRow key={g.id}>
                <TableCell>{marceneiros.find(m=>m.id===g.marceneiroId)?.nome || '-'}</TableCell>
                <TableCell>{g.pontos}</TableCell>
                <TableCell>
                    {g.conquistas && g.conquistas.length > 0
                        ? g.conquistas.map(badge => (
                            <span key={badge} className="mr-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                                {badge}
                            </span>
                          ))
                        : '-'}
                </TableCell>
                <TableCell>{g.nivel}</TableCell>
              </TableRow>
            ))}
        </Table>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold font-serif text-[#6a5f5f] dark:text-[#c7bca9] mb-4">Marceneiros (Gestão)</h2>
        <Table headers={['Nome', 'Cidade', 'Status', 'Ações']}>
            {marceneiros.map(m=>(
              <TableRow key={m.id}>
                <TableCell>{m.nome}</TableCell>
                <TableCell>{m.cidade}</TableCell>
                <TableCell>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${m.ativo ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                        {m.ativo ? "Ativo" : "Inativo"}
                    </span>
                </TableCell>
                <TableCell>
                  <button 
                    onClick={() => handleToggleMarceneiro(m)}
                    className={`font-semibold py-2 px-4 rounded-lg text-sm transition ${m.ativo ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900' : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900'}`}
                  >
                      {m.ativo ? "Desativar" : "Ativar"}
                  </button>
                </TableCell>
              </TableRow>
            ))}
        </Table>
      </section>
    </div>
  );
}