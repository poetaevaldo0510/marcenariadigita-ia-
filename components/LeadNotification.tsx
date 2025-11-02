
import React, { useEffect, useState } from "react";
import { ProIcon } from './Shared';

interface Lead {
  id: number;
  titulo: string;
  descricao: string;
  contato: string;
}

const simulateNewLeadCheck = (): Lead | null => {
    // Check if a lead was already "shown" and dismissed in this session
    const dismissedLeadId = sessionStorage.getItem('marcenapp_dismissed_lead_id');
    const potentialLeads: Lead[] = [
        { id: 1, titulo: "Cozinha Planejada em Moema, SP", descricao: "Cliente busca orçamento para armários de cozinha em L.", contato: "(11) 9XXXX-XXXX" },
        { id: 2, titulo: "Armário de Quarto Sob Medida", descricao: "Pedido para guarda-roupa embutido com portas de espelho.", contato: "(11) 9YYYY-YYYY" },
        { id: 3, titulo: "Móvel para Escritório Home Office", descricao: "Projeto para bancada e estantes otimizadas para home office.", contato: "(21) 9ZZZZ-ZZZZ" }
    ];

    // Simulate a random chance of a new lead appearing (e.g., 20% chance)
    if (Math.random() < 0.2) {
        const newLead = potentialLeads[Math.floor(Math.random() * potentialLeads.length)];
        
        // Only show if it hasn't been dismissed yet in this session
        if (newLead.id.toString() !== dismissedLeadId) {
            return newLead;
        }
    }
    return null;
};

export function LeadNotification() {
  const [lead, setLead] = useState<Lead | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check for a new lead only once when the component mounts
    const leadToCheck = simulateNewLeadCheck();
    if (leadToCheck) {
        setLead(leadToCheck);
        setIsVisible(true);
    } else {
        setLead(null);
        setIsVisible(false);
    }
  }, []); // Empty dependency array means this runs once on mount

  const dismissLead = () => {
      if (lead) {
          // Mark this lead as dismissed for the current session
          sessionStorage.setItem('marcenapp_dismissed_lead_id', lead.id.toString());
      }
      setIsVisible(false);
      setLead(null); // Also clear the lead so it doesn't try to render again
  };

  const handleClose = () => {
      dismissLead();
  };

  const handleActionButton = () => {
    // In a real app, this would navigate to lead details or open a response modal
    alert(`Ação para o lead "${lead?.titulo}"`);
    dismissLead();
  };

  if (!lead || !isVisible) return null;

  return (
    <div className="fixed top-5 right-5 z-50 bg-[#fffefb] dark:bg-[#4a4040] border-l-4 border-[#b99256] dark:border-[#d4ac6e] shadow-xl rounded-lg p-4 w-full max-w-sm animate-slideInRight">
      <button onClick={handleClose} className="absolute top-2 right-2 text-[#a89d8d] hover:text-[#3e3535] dark:hover:text-white">&times;</button>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xl text-[#b99256] dark:text-[#d4ac6e]"><ProIcon /></span>
        <span className="font-bold text-[#3e3535] dark:text-[#f5f1e8]">Novo Lead no EncontraPro!</span>
      </div>
      <h3 className="text-lg font-semibold text-[#3e3535] dark:text-[#f5f1e8]">{lead.titulo}</h3>
      <p className="mt-1 text-[#6a5f5f] dark:text-[#c7bca9] text-sm">{lead.descricao}</p>
      <div className="mt-4 flex gap-3">
        <button onClick={handleActionButton} className="bg-[#d4ac6e] text-[#3e3535] font-semibold px-4 py-2 rounded-lg hover:bg-[#c89f5e] text-sm">Responder agora</button>
        <button onClick={handleActionButton} className="border border-[#e6ddcd] dark:border-[#5a4f4f] px-3 py-2 rounded-lg hover:bg-[#f0e9dc] dark:hover:bg-[#3e3535] text-sm">Ver detalhes</button>
      </div>
    </div>
  );
}
