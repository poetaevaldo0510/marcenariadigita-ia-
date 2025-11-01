import React, { useEffect, useState } from "react";
import { ProIcon } from './Shared';

interface Lead {
  id: number;
  titulo: string;
  descricao: string;
  contato: string;
}

export function LeadNotification() {
  const [lead, setLead] = useState<Lead | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Simulação de API: substitua por chamada real GET /api/encontrapro/leads
  useEffect(() => {
    const timer = setTimeout(() => {
        setLead({
            id: 1,
            titulo: "Cozinha Planejada em Moema, SP",
            descricao: "Cliente busca orçamento para armários de cozinha em L.",
            contato: "(11) 9XXXX-XXXX"
        });
        setIsVisible(true);
    }, 8000); // Aparece após 8 segundos

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
      setIsVisible(false);
  }

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
        <button className="bg-[#d4ac6e] text-[#3e3535] font-semibold px-4 py-2 rounded-lg hover:bg-[#c89f5e] text-sm">Responder agora</button>
        <button className="border border-[#e6ddcd] dark:border-[#5a4f4f] px-3 py-2 rounded-lg hover:bg-[#f0e9dc] dark:hover:bg-[#3e3535] text-sm">Ver detalhes</button>
      </div>
    </div>
  );
}
