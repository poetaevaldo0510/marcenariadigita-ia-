import React, { useState, useRef } from 'react';
// FIX: Added Spinner to the import from Shared.
import { LogoIcon, CubeIcon, BlueprintIcon, BookIcon, ToolsIcon, CurrencyDollarIcon, StarIcon, CheckIcon, Spinner } from './Shared';
import { useTranslation } from '../contexts/I18nContext';
import type { Client } from '../types'; // Import Client type
import { saveClient } from '../services/historyService'; // Import saveClient

interface LandingPageProps {
  onLoginSuccess: (email: string) => void;
}

const plans = [
  {
    name: 'Hobby',
    price: 'Grátis',
    priceDescription: 'para começar',
    description: 'Ideal para entusiastas e projetos pessoais.',
    features: [
      'Até 5 projetos por mês',
      'Imagens 3D dos móveis',
      'Planta baixa 2D automática',
      'Histórico de projetos',
      'Suporte pela comunidade',
    ],
    cta: 'Começar Gratuitamente',
    planId: 'hobby',
  },
  {
    name: 'Profissional',
    price: 'R$ 119,90',
    priceDescription: '/mês',
    description: 'Para marceneiros autônomos e designers.',
    features: [
      'Projetos ilimitados',
      'Todas as funcionalidades do Hobby',
      'BOM e plano de corte otimizado',
      'Estimativa de custos automatizada',
      'Gerenciamento de clientes',
      'Propostas em PDF',
      'Suporte por e-mail prioritário',
    ],
    cta: 'Escolher Profissional',
    planId: 'pro',
    popular: true,
  },
  {
    name: 'Oficina',
    price: 'R$ 399,90',
    priceDescription: '/mês',
    description: 'Para marcenarias com equipes e alto volume.',
    features: [
      'Todos os recursos do Profissional',
      'Ferramentas para equipes (Em breve)',
      'Relatórios avançados de produtividade',
      'Compra automática de materiais (Beta)',
      'Integração WhatsApp (Beta)',
      'Acesso antecipado a novas funcionalidades',
    ],
    cta: 'Escolher Oficina',
    planId: 'business',
  },
];


const PlanCard: React.FC<{ plan: typeof plans[0]; onSelect: () => void; }> = ({ plan, onSelect }) => {
  const isPopular = plan.popular;
  return (
    <div className={`relative flex flex-col rounded-xl border p-6 shadow-lg transition-all duration-300 ${isPopular ? 'border-[#d4ac6e] bg-[#fffefb] dark:bg-[#3e3535] scale-105' : 'border-[#e6ddcd] dark:border-[#4a4040] bg-white dark:bg-[#2d2424] hover:shadow-xl'}`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#d4ac6e] text-[#3e3535] px-4 py-1 rounded-full text-sm font-semibold shadow-md">
          Mais Popular
        </div>
      )}
      <div className="flex-grow">
        <h3 className="text-2xl font-bold font-serif text-center text-[#3e3535] dark:text-[#f5f1e8]">{plan.name}</h3>
        <div className="mt-4 text-center flex items-baseline justify-center gap-2">
          
          <span className="text-4xl font-bold">{plan.price}</span>
          <span className="text-lg text-[#6a5f5f] dark:text-[#c7bca9]">{plan.priceDescription}</span>
        </div>
        <p className="mt-2 text-center text-[#8a7e7e] dark:text-[#a89d8d] h-12">{plan.description}</p>
        <ul className="mt-6 space-y-4">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckIcon className="w-6 h-6 text-green-500 flex-shrink-0 mr-3" />
              <span className="text-[#3e3535] dark:text-[#f5f1e8]">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <button 
        onClick={onSelect}
        className={`w-full mt-8 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 ${isPopular ? 'bg-gradient-to-r from-[#d4ac6e] to-[#b99256] text-[#3e3535]' : 'bg-[#e6ddcd] dark:bg-[#4a4040] text-[#3e3535] dark:text-[#f5f1e8] hover:bg-[#dcd6c8] dark:hover:bg-[#5a4f4f]'}`}
      >
        {plan.cta}
      </button>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-[#fffefb]/60 dark:bg-[#3e3535]/60 p-6 rounded-lg border border-[#e6ddcd] dark:border-[#4a4040] text-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="inline-block p-4 bg-[#e6ddcd] dark:bg-[#4a4040] rounded-full mb-4 text-[#b99256] dark:text-[#d4ac6e]">
            {icon}
        </div>
        <h3 className="text-xl font-semibold font-serif mb-2 text-[#3e3535] dark:text-[#f5f1e8]">{title}</h3>
        <p className="text-[#6a5f5f] dark:text-[#c7bca9]">{children}</p>
    </div>
);

const TestimonialCard: React.FC<{ quote: string; name: string; role: string; }> = ({ quote, name, role }) => (
    <div className="bg-[#fffefb]/70 dark:bg-[#3e3535]/70 p-6 rounded-lg border border-[#e6ddcd] dark:border-[#4a4040] shadow-md backdrop-blur-sm">
        <div className="flex text-yellow-500 mb-4">
            <StarIcon isFavorite /> <StarIcon isFavorite /> <StarIcon isFavorite /> <StarIcon isFavorite /> <StarIcon isFavorite />
        </div>
        <p className="text-[#6a5f5f] dark:text-[#c7bca9] italic mb-4">"{quote}"</p>
        <div>
            <p className="font-bold text-[#3e3535] dark:text-[#f5f1e8]">{name}</p>
            <p className="text-sm text-[#8a7e7e] dark:text-[#a89d8d]">{role}</p>
        </div>
    </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
    const { t, language, setLanguage } = useTranslation();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const loginRef = useRef<HTMLDivElement>(null);
    const waitlistRef = useRef<HTMLDivElement>(null); // New ref for waitlist section

    const [waitlistForm, setWaitlistForm] = useState<Omit<Client, 'id' | 'timestamp' | 'status'> & { status?: 'waitlist' }>({ 
        name: '', 
        email: '', 
        phone: '', 
        city: '', 
        motivation: '',
        status: 'waitlist'
    });
    const [waitlistMessage, setWaitlistMessage] = useState<string | null>(null);
    const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);


    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            if (email.trim() && email.includes('@')) {
                onLoginSuccess(email);
            } else {
                setError('Por favor, insira um e-mail válido.');
            }
            setIsLoading(false);
        }, 1000);
    };

    const scrollToLogin = () => {
        loginRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToWaitlist = () => { // New scroll function
        waitlistRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleWaitlistChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setWaitlistForm(prev => ({ ...prev, [name]: value }));
    };

    const handleWaitlistSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setWaitlistMessage(null);
        setIsSubmittingWaitlist(true);

        if (!waitlistForm.name.trim() || !waitlistForm.email.trim() || !waitlistForm.city.trim() || !waitlistForm.motivation.trim()) {
            setWaitlistMessage('Por favor, preencha todos os campos obrigatórios.');
            setIsSubmittingWaitlist(false);
            return;
        }

        try {
            // Save the client as 'waitlist'
            await saveClient(waitlistForm);
            setWaitlistMessage('Seu interesse foi registrado! Entraremos em contato em breve.');
            setWaitlistForm({ name: '', email: '', phone: '', city: '', motivation: '', status: 'waitlist' }); // Clear form
        } catch (err) {
            setWaitlistMessage('Erro ao registrar seu interesse. Tente novamente mais tarde.');
            console.error("Failed to save waitlist client:", err);
        } finally {
            setIsSubmittingWaitlist(false);
        }
    };


    return (
        <div className="bg-[#f5f1e8] dark:bg-[#2d2424] text-[#3e3535] dark:text-[#f5f1e8] animate-fadeIn">
            {/* Header */}
            <header className="py-4 px-6 md:px-12 flex justify-between items-center bg-[#f5f1e8]/80 dark:bg-[#2d2424]/80 backdrop-blur-sm sticky top-0 z-30 border-b border-[#e6ddcd] dark:border-[#4a4040]">
                <div className="flex items-center gap-3">
                    <LogoIcon className="w-8 h-8" />
                    <h1 className="text-2xl font-semibold tracking-tight">MarcenApp</h1>
                </div>
                <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1 border border-[#dcd6c8] dark:border-[#4a4040] rounded-full p-1">
                        <button onClick={() => setLanguage('pt-BR')} className={`px-2 py-0.5 rounded-full text-xs font-semibold transition ${language === 'pt-BR' ? 'bg-[#d4ac6e] text-white' : 'text-[#6a5f5f] dark:text-[#c7bca9] hover:bg-[#e6ddcd] dark:hover:bg-[#4a4040]'}`}>PT</button>
                        <button onClick={() => setLanguage('en')} className={`px-2 py-0.5 rounded-full text-xs font-semibold transition ${language === 'en' ? 'bg-[#d4ac6e] text-white' : 'text-[#6a5f5f] dark:text-[#c7bca9] hover:bg-[#e6ddcd] dark:hover:bg-[#4a4040]'}`}>EN</button>
                    </div>
                    <button
                        onClick={scrollToLogin}
                        className="bg-[#3e3535] dark:bg-[#d4ac6e] text-white dark:text-[#3e3535] font-bold py-2 px-6 rounded-lg hover:bg-[#2d2424] dark:hover:bg-[#c89f5e] transition"
                    >
                        {t('access')}
                    </button>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="py-20 md:py-28 px-6 bg-[#fffefb] dark:bg-[#3e3535]">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="text-center md:text-left animate-slideInLeft">
                             <h2 className="text-4xl md:text-6xl font-bold font-serif mb-4" dangerouslySetInnerHTML={{ __html: t('hero_title').replace('Em Minutos.', '<span class="text-[#b99256] dark:text-[#d4ac6e]">In Minutes.</span>').replace('In Minutes.', '<span class="text-[#b99256] dark:text-[#d4ac6e]">Em Minutos.</span>') }} />
                            <p className="text-lg md:text-xl max-w-2xl mx-auto md:mx-0 text-[#6a5f5f] dark:text-[#c7bca9] mb-8">
                                {t('hero_subtitle')}
                            </p>
                            <button
                                onClick={scrollToLogin}
                                className="bg-gradient-to-r from-[#d4ac6e] to-[#b99256] text-[#3e3535] font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg"
                            >
                                {t('start_creating_now')} &rarr;
                            </button>
                             <button
                                onClick={scrollToWaitlist}
                                className="mt-4 md:ml-4 bg-[#e6ddcd] dark:bg-[#4a4040] text-[#3e3535] dark:text-[#f5f1e8] font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg"
                            >
                                Cadastre-se Agora!
                            </button>
                        </div>
                         <div className="animate-slideInRight">
                            <img 
                                src="https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                                alt="Marcenaria moderna e elegante" 
                                className="rounded-xl shadow-2xl shadow-stone-400/30 dark:shadow-black/40 aspect-video object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 px-6 bg-[#fffefb] dark:bg-[#3e3535]">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold font-serif">A Marcenaria do Futuro, Hoje.</h2>
                            <p className="text-lg text-[#6a5f5f] dark:text-[#c7bca9] mt-2">Ferramentas inteligentes para cada etapa do seu projeto.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard icon={<CubeIcon className="w-8 h-8"/>} title="Projetos 3D Fotorrealistas">
                                Crie visualizações impressionantes a partir de descrições, fotos ou rascunhos. Mostre ao seu cliente exatamente como o móvel ficará.
                            </FeatureCard>
                            <FeatureCard icon={<BlueprintIcon className="w-8 h-8"/>} title="Plantas Técnicas 2D">
                                Converta automaticamente seus modelos 3D em plantas baixas e vistas técnicas com dimensionamento, prontas para a oficina.
                            </FeatureCard>
                             <FeatureCard icon={<BookIcon className="w-8 h-8"/>} title="Lista de Materiais (BOM)">
                                Gere uma lista detalhada de todas as chapas, ferragens e acessórios necessários, evitando erros e desperdícios na compra.
                            </FeatureCard>
                            <FeatureCard icon={<ToolsIcon className="w-8 h-8"/>} title="Plano de Corte Otimizado">
                                Receba um diagrama visual de como cortar as peças nas chapas, maximizando o aproveitamento do material e reduzindo custos.
                            </FeatureCard>
                            <FeatureCard icon={<CurrencyDollarIcon className="w-8 h-8"/>} title="Orçamentos e Propostas">
                                Estime custos de material e mão de obra com ajuda da IA e gere propostas comerciais profissionais em PDF com um clique.
                            </FeatureCard>
                             <FeatureCard icon={<LogoIcon className="w-8 h-8"/>} title="Assistente Iara">
                                Nossa IA especialista em marcenaria está sempre pronta para ajudar, desde a busca por tendências até a otimização de projetos.
                            </FeatureCard>
                        </div>
                    </div>
                </section>

                 {/* How It Works Section */}
                <section className="py-20 px-6">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="animate-slideInLeft">
                            <img 
                                src="https://images.unsplash.com/photo-1596079890744-c1a0462d0975?q=80&w=1771&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                                alt="Interior moderno com móveis planejados" 
                                className="rounded-xl shadow-2xl shadow-stone-400/30 dark:shadow-black/40 aspect-square object-cover"
                            />
                        </div>
                        <div className="animate-slideInRight">
                            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">Do Rascunho à Realidade em 3 Passos</h2>
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-[#e6ddcd] dark:bg-[#4a4040] text-[#b99256] dark:text-[#d4ac6e] font-bold text-xl mr-4">1</div>
                                    <div>
                                        <h3 className="font-bold text-lg">Descreva sua Ideia</h3>
                                        <p className="text-[#6a5f5f] dark:text-[#c7bca9]">Use texto, voz, fotos ou rascunhos. A Iara entende sua visão e a transforma em um conceito inicial.</p>
                                    </div>
                                </div>
                                 <div className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-[#e6ddcd] dark:bg-[#4a4040] text-[#b99256] dark:text-[#d4ac6e] font-bold text-xl mr-4">2</div>
                                    <div>
                                        <h3 className="font-bold text-lg">Gere e Refine o Projeto</h3>
                                        <p className="text-[#6a5f5f] dark:text-[#c7bca9]">Receba imagens 3D fotorrealistas e plantas 2D. Edite e ajuste detalhes com a ajuda da IA até ficar perfeito.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-[#e6ddcd] dark:bg-[#4a4040] text-[#b99256] dark:text-[#d4ac6e] font-bold text-xl mr-4">3</div>
                                    <div>
                                        <h3 className="font-bold text-lg">Prepare para a Produção</h3>
                                        <p className="text-[#6a5f5f] dark:text-[#c7bca9]">Com um clique, obtenha a lista de materiais, plano de corte e a proposta comercial para seu cliente.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section id="testimonials" className="py-20 px-6 bg-cover bg-center relative" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)'}}>
                     <div className="max-w-6xl mx-auto relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-8">O que os Marceneiros Dizem</h2>
                            <div className="space-y-8">
                                <TestimonialCard 
                                    name="Carlos Ferreira"
                                    role="Marceneiro, 15 anos de experiência"
                                    quote="O MarcenApp reduziu o tempo que eu levava para fazer propostas de 2 dias para 30 minutos. Meus clientes ficam impressionados com o 3D."
                                />
                                 <TestimonialCard 
                                    name="Juliana Andrade"
                                    role="Designer de Móveis"
                                    quote="A geração da lista de materiais e do plano de corte é fantástica. Acabou o erro de cálculo na hora de comprar as chapas. A economia é real."
                                />
                                 <TestimonialCard 
                                    name="Ricardo Martins"
                                    role="Dono de Marcenaria"
                                    quote="Consigo apresentar projetos muito mais profissionais e fechar mais negócios. É como ter um designer e um engenheiro na equipe."
                                />
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            {/* This is a spacer column, the background image fills the space */}
                        </div>
                     </div>
                </section>

                {/* Plans Section */}
                <section id="plans" className="py-20 px-6 bg-[#fffefb] dark:bg-[#3e3535]">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold font-serif">Planos Flexíveis para o seu Negócio</h2>
                            <p className="text-lg text-[#6a5f5f] dark:text-[#c7bca9] mt-2">Comece de graça e evolua conforme suas necessidades.</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            {plans.map(plan => (
                                <PlanCard key={plan.name} plan={plan} onSelect={scrollToWaitlist} />
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* NEW: Waitlist / Cadastro de Interesse Section */}
                <section id="waitlist" ref={waitlistRef} className="py-20 px-6 bg-[#f0e9dc] dark:bg-[#2d2424] border-t border-[#e6ddcd] dark:border-[#4a4040]">
                    <div className="w-full max-w-md mx-auto text-center">
                        <h2 className="text-3xl font-bold font-serif text-[#3e3535] dark:text-[#f5f1e8] mb-4">Junte-se à Lista de Espera para o EncontraPro!</h2>
                        <p className="text-lg text-[#6a5f5f] dark:text-[#c7bca9] mb-8">
                            Seja um dos primeiros a ter acesso total ao nosso marketplace de projetos, conectando você a novos clientes. Responda algumas perguntas rápidas para nos ajudar a te conhecer melhor.
                        </p>
                        <div className="bg-[#fffefb]/80 dark:bg-[#4a4040] backdrop-blur-sm p-8 rounded-xl border border-[#e6ddcd] dark:border-[#4a4040] shadow-2xl shadow-stone-300/30 dark:shadow-black/30">
                            <h3 className="text-2xl font-serif font-semibold text-center text-[#3e3535] dark:text-[#f5f1e8] mb-6">Cadastro de Interesse</h3>
                            <form onSubmit={handleWaitlistSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="waitlist-name" className="block text-sm font-medium text-[#6a5f5f] dark:text-[#c7bca9]">
                                        Seu Nome ou Nome da Marcenaria *
                                    </label>
                                    <input
                                        id="waitlist-name"
                                        name="name"
                                        type="text"
                                        required
                                        value={waitlistForm.name}
                                        onChange={handleWaitlistChange}
                                        className="mt-1 block w-full bg-[#f0e9dc] dark:bg-[#2d2424] border-2 border-[#e6ddcd] dark:border-[#5a4f4f] rounded-lg p-3 text-[#3e3535] dark:text-[#f5f1e8] focus:outline-none focus:ring-2 focus:ring-[#d4ac6e] focus:border-[#d4ac6e] transition"
                                        placeholder="Nome Completo ou Razão Social"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="waitlist-email" className="block text-sm font-medium text-[#6a5f5f] dark:text-[#c7bca9]">
                                        Seu E-mail *
                                    </label>
                                    <input
                                        id="waitlist-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={waitlistForm.email}
                                        onChange={handleWaitlistChange}
                                        className="mt-1 block w-full bg-[#f0e9dc] dark:bg-[#2d2424] border-2 border-[#e6ddcd] dark:border-[#5a4f4f] rounded-lg p-3 text-[#3e3535] dark:text-[#f5f1e8] focus:outline-none focus:ring-2 focus:ring-[#d4ac6e] focus:border-[#d4ac6e] transition"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="waitlist-phone" className="block text-sm font-medium text-[#6a5f5f] dark:text-[#c7bca9]">
                                        Telefone (Opcional)
                                    </label>
                                    <input
                                        id="waitlist-phone"
                                        name="phone"
                                        type="tel"
                                        value={waitlistForm.phone}
                                        onChange={handleWaitlistChange}
                                        className="mt-1 block w-full bg-[#f0e9dc] dark:bg-[#2d2424] border-2 border-[#e6ddcd] dark:border-[#5a4f4f] rounded-lg p-3 text-[#3e3535] dark:text-[#f5f1e8] focus:outline-none focus:ring-2 focus:ring-[#d4ac6e] focus:border-[#d4ac6e] transition"
                                        placeholder="(XX) XXXXX-XXXX"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="waitlist-city" className="block text-sm font-medium text-[#6a5f5f] dark:text-[#c7bca9]">
                                        Sua Cidade de Atuação *
                                    </label>
                                    <input
                                        id="waitlist-city"
                                        name="city"
                                        type="text"
                                        required
                                        value={waitlistForm.city}
                                        onChange={handleWaitlistChange}
                                        className="mt-1 block w-full bg-[#f0e9dc] dark:bg-[#2d2424] border-2 border-[#e6ddcd] dark:border-[#5a4f4f] rounded-lg p-3 text-[#3e3535] dark:text-[#f5f1e8] focus:outline-none focus:ring-2 focus:ring-[#d4ac6e] focus:border-[#d4ac6e] transition"
                                        placeholder="Ex: São Paulo"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="waitlist-motivation" className="block text-sm font-medium text-[#6a5f5f] dark:text-[#c7bca9]">
                                        O que você mais busca no MarcenApp e como ele pode te ajudar? *
                                    </label>
                                    <textarea
                                        id="waitlist-motivation"
                                        name="motivation"
                                        rows={4}
                                        required
                                        value={waitlistForm.motivation}
                                        onChange={handleWaitlistChange}
                                        className="mt-1 block w-full bg-[#f0e9dc] dark:bg-[#2d2424] border-2 border-[#e6ddcd] dark:border-[#5a4f4f] rounded-lg p-3 text-[#3e3535] dark:text-[#f5f1e8] focus:outline-none focus:ring-2 focus:ring-[#d4ac6e] focus:border-[#d4ac6e] transition"
                                        placeholder="Ex: Preciso de projetos 3D rápidos e planos de corte otimizados para reduzir meu tempo de planejamento e custo de material."
                                    />
                                </div>
                                {waitlistMessage && (
                                    <p className={`text-sm text-center ${waitlistMessage.includes('Erro') ? 'text-red-500' : 'text-green-500'}`}>
                                        {waitlistMessage}
                                    </p>
                                )}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={isSubmittingWaitlist}
                                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-[#3e3535] bg-[#d4ac6e] hover:bg-[#c89f5e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4ac6e] transition disabled:opacity-50"
                                    >
                                        {isSubmittingWaitlist ? <Spinner size="sm" /> : <CheckIcon className="w-5 h-5"/>}
                                        <span>{isSubmittingWaitlist ? 'Enviando...' : 'Cadastrar na Lista de Espera'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>


                {/* Login/CTA Section */}
                <section id="login" ref={loginRef} className="py-20 px-6">
                    <div className="w-full max-w-md mx-auto">
                        <div className="flex flex-col items-center mb-8">
                            <h2 className="text-3xl font-bold font-serif text-[#3e3535] dark:text-[#f5f1e8] text-center">Pronto para revolucionar sua marcenaria?</h2>
                            <p className="text-[#6a5f5f] dark:text-[#c7bca9] text-lg mt-2 text-center">Acesse sua conta ou crie um acesso gratuito para começar.</p>
                        </div>
                        <div className="bg-[#fffefb]/80 dark:bg-[#4a4040] backdrop-blur-sm p-8 rounded-xl border border-[#e6ddcd] dark:border-[#4a4040] shadow-2xl shadow-stone-300/30 dark:shadow-black/30">
                            <h3 className="text-2xl font-serif font-semibold text-center text-[#3e3535] dark:text-[#f5f1e8] mb-6">{t('access_account')}</h3>
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div>
                                    <label htmlFor="email-landing" className="block text-sm font-medium text-[#6a5f5f] dark:text-[#c7bca9]">
                                        Seu melhor e-mail
                                    </label>
                                    <input
                                        id="email-landing"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 block w-full bg-[#f0e9dc] dark:bg-[#2d2424] border-2 border-[#e6ddcd] dark:border-[#5a4f4f] rounded-lg p-3 text-[#3e3535] dark:text-[#f5f1e8] focus:outline-none focus:ring-2 focus:ring-[#d4ac6e] focus:border-[#d4ac6e] transition"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-[#3e3535] bg-[#d4ac6e] hover:bg-[#c89f5e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4ac6e] transition disabled:opacity-50"
                                    >
                                        {isLoading ? t('checking') : t('enter')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#e6ddcd] dark:bg-[#2d2424] text-[#6a5f5f] dark:text-[#a89d8d] py-8 px-6 text-center">
                <p>&copy; {new Date().getFullYear()} MarcenApp. Todos os direitos reservados.</p>
                <p className="text-sm mt-2">Feito para marceneiros, por apaixonados por tecnologia e design.</p>
            </footer>
        </div>
    );
};