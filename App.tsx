import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Types
import type { AlertState, ImageModalState, ProjectHistoryItem, Finish, Client, PricedBomItem, Comment } from './types.ts';

// Services
import { projectTypePresets, initialStylePresets } from './services/presetService.ts';
import { generateImage, generateText, editImage, generateCuttingPlan, editFloorPlan, estimateProjectCosts, generateAssemblyDetails, parseBomToList, findSupplierPrice, calculateFinancialSummary, fetchSupplierCatalog, calculateShippingCost, suggestAlternativeStyles, generateFloorPlanFrom3D, generate3Dfrom2D, suggestImageEdits, generateBom, suggestAlternativeFinishes } from './services/geminiService.ts';
import { getHistory, addProjectToHistory, updateProjectInHistory, removeProjectFromHistory, getClients, saveClient, removeClient, getFavoriteFinishes, addFavoriteFinish, removeFavoriteFinish } from './services/historyService.ts';
import { addTitleToImage, convertMarkdownToHtml } from './utils/helpers.ts';
import { useTranslation } from './contexts/I18nContext.tsx';


// Components
import { Header } from './components/Header.tsx';
import { AlertModal, ImageModal, ConfirmationModal, Spinner, WandIcon, BlueprintIcon, CubeIcon, ToolsIcon, DocumentDuplicateIcon, BookIcon, CheckIcon, StarIcon, SparklesIcon, RulerIcon, LogoIcon, CurrencyDollarIcon, WhatsappIcon, StoreIcon, UsersIcon, TagIcon, SearchIcon, MessageIcon, TimerIcon, CatalogIcon, DollarCircleIcon, ARIcon, VideoIcon, CommunityIcon, ProIcon, DocumentTextIcon, EarlyAccessModal, EllipsisVerticalIcon, TrophyIcon } from './components/Shared.tsx';
import { StyleAssistant } from './components/StyleAssistant.tsx';
import { FinishesSelector } from './components/FinishesSelector.tsx';
import { ImageUploader } from './components/ImageUploader.tsx';
import { VoiceInputButton } from './components/VoiceInputButton.tsx';
import { HistoryPanel } from './components/HistoryPanel.tsx';
import { AboutModal } from './components/AboutModal.tsx';
import { LiveAssistant } from './components/LiveAssistant.tsx';
import { ResearchAssistant } from './components/ResearchAssistant.tsx';
import { DistributorFinder } from './components/DistributorFinder.tsx';
import { ClientPanel } from './components/ClientPanel.tsx';
import { ImageEditor } from './components/ImageEditor.tsx';
import { InteractiveImageViewer } from './components/InteractiveImageViewer.tsx';
import { LayoutEditor } from './components/LayoutEditor.tsx';
import { ProposalModal } from './components/ProposalModal.tsx';
import { NewViewGenerator } from './components/NewViewGenerator.tsx';
import { BomGeneratorModal } from './components/BomGeneratorModal.tsx';
import { CuttingPlanGeneratorModal } from './components/CuttingPlanGeneratorModal.tsx';
import { CostEstimatorModal } from './components/CostEstimatorModal.tsx';
import { ARViewer } from './components/ARViewer.tsx';
import { EncontraProModal } from './components/EncontraProModal.tsx';
import { PerformanceModal } from './components/PerformanceModal.tsx';
import { WhatsappSenderModal } from './components/WhatsappSenderModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { LeadNotification } from './components/LeadNotification.tsx';
import DashboardAdmin from './admin/DashboardAdmin.tsx';
import { AssemblyDetailsModal } from './components/AssemblyDetailsModal.tsx'; // Import the new modal

interface AppProps {
  onLogout: () => void;
  userEmail: string;
  userPlan: string;
}

export const App: React.FC<AppProps> = ({ onLogout, userEmail, userPlan }) => {
    const { t } = useTranslation();

    // --- STATE MANAGEMENT ---
    const [isLoading, setIsLoading] = useState(false);
    const [currentProject, setCurrentProject] = useState<ProjectHistoryItem | null>(null);
    const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

    // Form State
    const [projectDescription, setProjectDescription] = useState('');
    const [projectPreset, setProjectPreset] = useState(projectTypePresets[0].id);
    const [selectedStyle, setSelectedStyle] = useState(initialStylePresets[0]);
    const [selectedFinish, setSelectedFinish] = useState<{ manufacturer: string; finish: Finish; handleDetails?: string } | null>(null);
    const [uploadedImages, setUploadedImages] = useState<{ data: string; mimeType: string }[] | null>(null);

    // Data Stores
    const [history, setHistory] = useState<ProjectHistoryItem[]>([]);
    const [clients, setClients] = useState<Client[]>([]); // These are now MarcenApp's *partner carpenters/contacts*
    const [favoriteFinishes, setFavoriteFinishes] = useState<Finish[]>([]);

    // UI Modals & Panels State
    const [alert, setAlert] = useState<AlertState>({ show: false, title: '', message: '' });
    const [imageModal, setImageModal] = useState<ImageModalState>({ show: false, src: '' });
    const [confirmationModal, setConfirmationModal] = useState<{ show: boolean; title: string; message: string; onConfirm: () => void; }>({ show: false, title: '', message: '', onConfirm: () => {} });
    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [isLiveAssistantOpen, setIsLiveAssistantOpen] = useState(false);
    const [isResearchAssistantOpen, setIsResearchAssistantOpen] = useState(false);
    const [isDistributorFinderOpen, setIsDistributorFinderOpen] = useState(false);
    const [isClientPanelOpen, setIsClientPanelOpen] = useState(false);
    const [imageEditorState, setImageEditorState] = useState<{ isOpen: boolean, src: string, initialPrompt?: string }>({ isOpen: false, src: '' });
    const [layoutEditorState, setLayoutEditorState] = useState<{ isOpen: boolean, src: string }>({ isOpen: false, src: '' });
    const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
    const [isNewViewModalOpen, setIsNewViewModalOpen] = useState(false);
    const [isBomGeneratorModalOpen, setIsBomGeneratorModalOpen] = useState(false);
    const [isCuttingPlanGeneratorModalOpen, setIsCuttingPlanGeneratorModalOpen] = useState(false);
    const [isCostEstimatorModalOpen, setIsCostEstimatorModalOpen] = useState(false);
    const [arViewerState, setArViewerState] = useState<{ isOpen: boolean; src: string }>({ isOpen: false, src: '' });
    const [isEncontraProModalOpen, setIsEncontraProModalOpen] = useState(false);
    const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
    const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isAutoPurchaseModalOpen, setIsAutoPurchaseModalOpen] = useState(false);
    const [isEmployeeManagementModalOpen, setIsEmployeeManagementModalOpen] = useState(false);
    const [isLearningHubModalOpen, setIsLearningHubModalOpen] = useState(false);
    const [is3DFrom2DModalOpen, setIs3DFrom2DModalOpen] = useState(false);
    const [isGenerating3D, setIsGenerating3D] = useState(false);
    const [isAdminView, setIsAdminView] = useState(false);
    const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
    const [editSuggestions, setEditSuggestions] = useState<string[]>([]);
    const [isSuggestingEdits, setIsSuggestingEdits] = useState(false);
    const [suggestionTargetImage, setSuggestionTargetImage] = useState<string | null>(null);

    // New state for style suggestions directly from Project3DViewer
    const [isStyleSuggestionsModalOpen, setIsStyleSuggestionsModalOpen] = useState(false);
    const [suggestedStylesForCurrentProject, setSuggestedStylesForCurrentProject] = useState<string[]>([]);
    const [isFetchingStyleSuggestions, setIsFetchingStyleSuggestions] = useState(false);
    const [styleSuggestionTargetImage, setStyleSuggestionTargetImage] = useState<string | null>(null);

    // NEW: State for finish suggestions
    const [isSuggestedFinishesModalOpen, setIsSuggestedFinishesModalOpen] = useState(false);
    const [suggestedFinishesForCurrentProject, setSuggestedFinishesForCurrentProject] = useState<Finish[]>([]);
    const [isFetchingFinishSuggestions, setIsFetchingFinishSuggestions] = useState(false);
    const [finishSuggestionTargetImage, setFinishSuggestionTargetImage] = useState<string | null>(null);


    // New state for 3D from 2D modal initial values
    const [modal3DFrom2DInitialStyle, setModal3DFrom2DInitialStyle] = useState<string | null>(null);
    const [modal3DFrom2DInitialFinish, setModal3DFrom2DInitialFinish] = useState<string | null>(null);

    // State for Assembly Details Modal
    const [isAssemblyDetailsModalOpen, setIsAssemblyDetailsModalOpen] = useState(false);
    const [assemblyDetails, setAssemblyDetails] = useState<string | null>(null);
    const [isGeneratingAssemblyDetails, setIsGeneratingAssemblyDetails] = useState(false);

    // New state for NewViewGenerator initial style and finish
    const [newViewInitialStyle, setNewViewInitialStyle] = useState<string | null>(null);
    const [newViewInitialFinish, setNewViewInitialFinish] = useState<string | null>(null);


    // Theme
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // --- COMPUTED VALUES ---
    const isAdmin = useMemo(() => userPlan === 'business' || userPlan === 'pro', [userPlan]);
    // currentClient is now a 'marceneiro' contact, not directly linked to the current project as an end-client.
    // So, we don't need a currentClient computed value here for project-specific operations.
    // const currentClient = useMemo(() => clients.find(c => c.id === currentProject?.clientId), [clients, currentProject]);

    // Check if the current project's finish is a favorite
    const isCurrentProjectFinishFavorite = useMemo(() => {
        if (!currentProject?.selectedFinish) return false;
        return favoriteFinishes.some(fav => fav.id === currentProject.selectedFinish!.finish.id);
    }, [currentProject, favoriteFinishes]);

    // --- EFFECTS ---
    useEffect(() => {
        const savedTheme = localStorage.getItem('marcenapp-theme') as 'light' | 'dark' | null;
        if (savedTheme) setTheme(savedTheme);
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('marcenapp-theme', theme);
    }, [theme]);

    useEffect(() => {
        (async () => {
            setHistory(await getHistory());
            setClients(await getClients());
            setFavoriteFinishes(await getFavoriteFinishes());
        })();
    }, []);

    // --- HANDLERS & CALLBACKS ---
    const showAlert = useCallback((message: string, title = 'Aviso') => {
        setAlert({ show: true, title, message });
    }, []);
    
    const handleSelectPreset = (id: string) => {
        setProjectPreset(id);
        const preset = projectTypePresets.find(p => p.id === id);
        if (preset && preset.suggestions) {
            setProjectDescription(preset.suggestions[0]);
        }
    };

    const handleStyleTagSelect = (tag: string) => {
        setProjectDescription(prev => prev ? `${prev.trim()}, ${tag.toLowerCase()}` : tag);
    };

    const handleRecordingUpdate = (transcript: string, isFinal: boolean) => {
        setProjectDescription(transcript);
    };

    const clearForm = useCallback(() => {
        setProjectDescription('');
        setProjectPreset(projectTypePresets[0].id);
        setSelectedStyle(initialStylePresets[0]);
        setSelectedFinish(null);
        setUploadedImages(null);
    }, []);

    const handleViewProject = (project: ProjectHistoryItem) => {
        setCurrentProject(project);
        clearForm();
        setIsHistoryPanelOpen(false);
        setViewMode('3d');
    };
    
    const handleGenerateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectDescription.trim()) {
            showAlert('Por favor, descreva o projeto que você deseja criar.');
            return;
        }
        
        setIsLoading(true);
        setCurrentProject(null);
        
        try {
            const preset = projectTypePresets.find(p => p.id === projectPreset);
            const gender = preset?.gender || 'o';
            const presetName = preset?.name || 'Móvel';
            const fullDescription = `Um${gender} ${presetName.toLowerCase()} no estilo ${selectedStyle}, com acabamento principal em ${selectedFinish?.finish.name || 'madeira'}. Detalhes: ${projectDescription}. ${selectedFinish?.handleDetails ? `Detalhes do puxador: ${selectedFinish.handleDetails}.` : ''}`;
            
            const basePrompt = `Gere uma imagem 3D fotorrealista de alta qualidade de um móvel com base na seguinte descrição. O fundo deve ser um estúdio de fotografia minimalista com iluminação suave. Foco total no móvel. Descrição: "${fullDescription}"`;

            const viewPrompts = [
                basePrompt, // Primary view
                `Gere uma imagem 3D fotorrealista de alta qualidade do MESMO móvel, mas de um ângulo lateral e com iluminação mais dramática. O fundo deve ser um estúdio de fotografia minimalista. Descrição: "${fullDescription}"`, // Side view
                `Gere uma imagem 3D fotorrealista de alta qualidade do MESMO móvel, visto de cima, em perspectiva isométrica, com iluminação ambiente. O fundo deve ser um estúdio de fotografia minimalista. Descrição: "${fullDescription}"`, // Top-down view
            ];

            const generatedViews: string[] = [];
            const projectName = `${presetName} ${selectedStyle}`;
            const projectDate = new Date().toLocaleDateString('pt-BR');

            for (const prompt of viewPrompts) {
                const imageBase64 = await generateImage(prompt, uploadedImages);
                const imageWithTitle = await addTitleToImage(imageBase64, projectName, projectDate);
                generatedViews.push(imageWithTitle);
            }
            
            const newProject: Omit<ProjectHistoryItem, 'id'|'timestamp'> = {
                name: projectName,
                description: fullDescription,
                style: selectedStyle,
                selectedFinish: selectedFinish,
                views3d: generatedViews, // Use the array of generated views
                image2d: null,
                uploadedReferenceImageUrls: uploadedImages?.map(img => `data:${img.mimeType};base64,${img.data}`),
                bom: null,
                assemblyDetails: null, // Initialize bom as null
                endClientName: undefined, // Initialize new end-client fields
                endClientPhone: undefined,
            };

            const updatedHistory = await addProjectToHistory(newProject);
            setHistory(updatedHistory);
            setCurrentProject(updatedHistory[0]);
            clearForm();

        } catch (error) {
            console.error('Error generating project:', error);
            showAlert(error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.', 'Erro na Geração');
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- Project actions ---
    const handleDeleteProject = (id: string) => {
        setConfirmationModal({
            show: true,
            title: "Confirmar Exclusão",
            message: `Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.`,
            onConfirm: async () => {
                const updatedHistory = await removeProjectFromHistory(id);
                setHistory(updatedHistory);
                if (currentProject?.id === id) {
                    setCurrentProject(null);
                }
                setConfirmationModal({ ...confirmationModal, show: false });
            },
        });
    };
    
    const handleGenerateFloorPlan = async () => {
        if (!currentProject) return;
        setIsLoading(true);
        try {
            const imageBase64 = await generateFloorPlanFrom3D(currentProject);
            const projectDate = new Date(currentProject.timestamp).toLocaleDateString('pt-BR');
            const imageWithTitle = await addTitleToImage(imageBase64, `${currentProject.name} - Planta Baixa`, projectDate);
            const imageUrl = imageWithTitle;
            const updatedProject = await updateProjectInHistory(currentProject.id, { image2d: imageUrl });
            if (updatedProject) {
                setCurrentProject(updatedProject);
                setHistory(await getHistory());
                setViewMode('2d'); // Switch to the new 2D view automatically
                showAlert('Planta baixa 2D gerada com sucesso e adicionada ao projeto!', 'Sucesso'); // ADDED ALERT
            }
        } catch (error) {
            showAlert(error instanceof Error ? error.message : 'Erro ao gerar planta baixa.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveEditedImage = async (newImageBase64: string) => {
        if (!currentProject) return;
        const projectDate = new Date().toLocaleDateString('pt-BR');
        const imageWithTitle = await addTitleToImage(newImageBase64, `${currentProject.name} - Edição`, projectDate);
        const newImageUrl = imageWithTitle;
        const updatedViews = [...currentProject.views3d, newImageUrl];
        const updatedProject = await updateProjectInHistory(currentProject.id, { views3d: updatedViews });
        if (updatedProject) {
            setCurrentProject(updatedProject);
            setHistory(await getHistory());
        }
        setImageEditorState({ isOpen: false, src: '' });
    };
    
    const handleSaveEditedLayout = async (newImageBase64: string) => {
        if (!currentProject) return;
        const projectDate = new Date().toLocaleDateString('pt-BR');
        const imageWithTitle = await addTitleToImage(newImageBase64, `${currentProject.name} - Layout Editado`, projectDate);
        const newImageUrl = imageWithTitle;
        const updatedProject = await updateProjectInHistory(currentProject.id, { image2d: newImageUrl });
        if (updatedProject) {
            setCurrentProject(updatedProject);
            setHistory(await getHistory());
        }
        setLayoutEditorState({ isOpen: false, src: '' });
    };

    const handleToggleFavoriteFinish = async (finish: Finish) => {
        const isFavorite = favoriteFinishes.some(fav => fav.id === finish.id);
        const updatedFavorites = isFavorite
            ? await removeFavoriteFinish(finish.id)
            : await addFavoriteFinish(finish);
        setFavoriteFinishes(updatedFavorites);
    };

    const handleGenerate3DFrom2D = async (style: string, finish: string) => {
        if (!currentProject || !currentProject.image2d) return;
        setIsGenerating3D(true);
        try {
            // FIX: Corrected function name
            const imageBase64 = await generate3Dfrom2D(currentProject, style, finish);
            const projectDate = new Date().toLocaleDateString('pt-BR');
            const title = `${currentProject.name} - Vista 3D (${style})`;
            const imageWithTitle = await addTitleToImage(imageBase64, title, projectDate);
            const imageUrl = imageWithTitle;
            
            const updatedViews = [...currentProject.views3d, imageUrl];
            const updatedProject = await updateProjectInHistory(currentProject.id, { views3d: updatedViews });

            if (updatedProject) {
                setCurrentProject(updatedProject);
                setHistory(await getHistory());
                setViewMode('3d');
                setIs3DFrom2DModalOpen(false);
            }

        } catch (error) {
            showAlert(error instanceof Error ? error.message : 'Erro ao gerar a vista 3D.');
        } finally {
            setIsGenerating3D(false);
        }
    };
    
    const handleSaveCuttingPlan = async (updates: Partial<ProjectHistoryItem>) => {
        if (!currentProject) return;
        try {
            const updatedProject = await updateProjectInHistory(currentProject.id, updates);
            if (updatedProject) {
                setCurrentProject(updatedProject);
                setHistory(await getHistory());
                showAlert('Plano de corte salvo com sucesso no projeto!', 'Sucesso');
            }
        } catch (error) {
            showAlert(error instanceof Error ? error.message : 'Erro ao salvar o plano de corte.');
        }
    };

    const handleSaveBom = async (bom: string) => {
        if (!currentProject) return;
        try {
            const updatedProject = await updateProjectInHistory(currentProject.id, { bom });
            if (updatedProject) {
                setCurrentProject(updatedProject);
                setHistory(await getHistory());
                showAlert('Lista de Materiais salva com sucesso no projeto!', 'Sucesso');
            }
        } catch (error) {
            showAlert(error instanceof Error ? error.message : 'Erro ao salvar a BOM.');
        }
    };

    const handleOpenEditSuggestions = async (imageSrc: string) => {
        if (!currentProject) return;
        setIsSuggestingEdits(true);
        setIsSuggestionsModalOpen(true);
        setEditSuggestions([]);
        setSuggestionTargetImage(imageSrc);
        try {
            const suggestions = await suggestImageEdits(currentProject.description, imageSrc);
            setEditSuggestions(suggestions);
        } catch (error) {
            showAlert(error instanceof Error ? error.message : "Falha ao obter sugestões.");
            setIsSuggestionsModalOpen(false);
        } finally {
            setIsSuggestingEdits(false);
        }
    };
    
    const handleSelectSuggestion = (suggestion: string) => {
        setIsSuggestionsModalOpen(false);
        if (suggestionTargetImage) {
            setImageEditorState({ isOpen: true, src: suggestionTargetImage, initialPrompt: suggestion });
        }
        setEditSuggestions([]);
        setSuggestionTargetImage(null);
    };

    // New handler for opening style suggestions from the 3D viewer
    const handleOpenProjectStyleSuggestions = async (imageSrc: string) => {
        if (!currentProject) return;
        setIsFetchingStyleSuggestions(true);
        setIsStyleSuggestionsModalOpen(true);
        setSuggestedStylesForCurrentProject([]);
        setStyleSuggestionTargetImage(imageSrc);

        try {
            const suggestions = await suggestAlternativeStyles(currentProject.description, currentProject.style, imageSrc);
            setSuggestedStylesForCurrentProject(suggestions);
        } catch (error) {
            showAlert(error instanceof Error ? error.message : "Falha ao obter sugestões de estilo.");
            setIsStyleSuggestionsModalOpen(false);
        } finally {
            setIsFetchingStyleSuggestions(false);
        }
    };

    // New handler for selecting a suggested style from the modal
    const handleSelectSuggestedStyle = (suggestion: string) => {
        setIsStyleSuggestionsModalOpen(false);
        setSelectedStyle(suggestion); // Apply to the main creation form
        setSuggestedStylesForCurrentProject([]);
        setStyleSuggestionTargetImage(null);
    };

    // NEW: Handler for opening finish suggestions from the 3D viewer
    const handleOpenFinishSuggestions = async (imageSrc: string) => {
        if (!currentProject) return;
        setIsFetchingFinishSuggestions(true);
        setIsSuggestedFinishesModalOpen(true);
        setSuggestedFinishesForCurrentProject([]);
        setFinishSuggestionTargetImage(imageSrc);

        try {
            const suggestions = await suggestAlternativeFinishes(currentProject.description, imageSrc, currentProject.selectedFinish?.finish.name);
            setSuggestedFinishesForCurrentProject(suggestions);
        } catch (error) {
            showAlert(error instanceof Error ? error.message : "Falha ao obter sugestões de acabamento.");
            setIsSuggestedFinishesModalOpen(false);
        } finally {
            setIsFetchingFinishSuggestions(false);
        }
    };

    // NEW: Handler for selecting a suggested finish from the modal
    const handleSelectFinishSuggestion = (finish: Finish) => {
        setIsSuggestedFinishesModalOpen(false);
        setSelectedFinish({
            manufacturer: finish.manufacturer,
            finish,
            handleDetails: finish.type === 'solid' ? 'Puxador Cava' : undefined,
        });
        setSuggestedFinishesForCurrentProject([]);
        setFinishSuggestionTargetImage(null);
    };


    const handleOpenGenerate3DFrom2DModal = (style: string | null = null, finish: string | null = null) => {
        setModal3DFrom2DInitialStyle(style);
        setModal3DFrom2DInitialFinish(finish);
        setIs3DFrom2DModalOpen(true);
    };

    // Handler for generating assembly details
    const handleGenerateAssemblyDetails = async () => {
        if (!currentProject) {
            showAlert('Seccione ou gere um projeto primeiro.', 'Atenção');
            return;
        }
        if (!currentProject.bom) {
            showAlert('É necessário gerar a Lista de Materiais (BOM) do projeto primeiro.', 'Atenção');
            return;
        }
        setIsGeneratingAssemblyDetails(true);
        setAssemblyDetails(null);
        setIsAssemblyDetailsModalOpen(true); // Open modal immediately to show loading state

        try {
            const details = await generateAssemblyDetails(currentProject);
            setAssemblyDetails(details);
        } catch (error) {
            showAlert(error instanceof Error ? error.message : 'Ocorreu um erro desconhecido ao gerar as instruções de montagem.', 'Erro na Geração');
            setIsAssemblyDetailsModalOpen(false); // Close on error
        } finally {
            setIsGeneratingAssemblyDetails(false);
        }
    };

    // Handler for saving assembly details
    const handleSaveAssemblyDetails = async (details: string) => {
        if (!currentProject) return;
        try {
            const updatedProject = await updateProjectInHistory(currentProject.id, { assemblyDetails: details });
            if (updatedProject) {
                setCurrentProject(updatedProject);
                setHistory(await getHistory());
                showAlert('Instruções de montagem salvas com sucesso no projeto!', 'Sucesso');
            }
        } catch (error) {
            showAlert(error instanceof Error ? error.message : 'Erro ao salvar as instruções de montagem.', 'Erro');
        }
    };

    // New handler for opening NewViewGenerator with initial style/finish
    const handleOpenNewViewModal = (style: string | null = null, finish: string | null = null) => {
        setNewViewInitialStyle(style);
        setNewViewInitialFinish(finish);
        setIsNewViewModalOpen(true);
    };


    // --- SUB-COMPONENTS ---
    const Project3DViewer: React.FC<{
        views: string[];
        onEditClick: (src: string) => void;
        onARClick: (src: string) => void;
        onNewViewClick: (style: string | null, finish: string | null) => void; // Updated prop type
        onSuggestEditsClick: (src: string) => void;
        onSuggestStylesClick: (src: string) => void; 
        onSuggestFinishesClick: (src: string) => void; // NEW PROP
        onGenerate3DFrom2DClick: (style: string | null, finish: string | null) => void; // CHANGED PROP TYPE FOR NULL
        projectName: string;
        has2DPlan: boolean; // NEW PROP
      }> = ({ views, onEditClick, onARClick, onNewViewClick, onSuggestEditsClick, onSuggestStylesClick, onSuggestFinishesClick, onGenerate3DFrom2DClick, projectName, has2DPlan }) => {
          const [activeIndex, setActiveIndex] = useState(0);
          const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
          const actionMenuRef = useRef<HTMLDivElement>(null);
      
          useEffect(() => { setActiveIndex(0); }, [views]);
      
          useEffect(() => {
              const handleClickOutside = (event: MouseEvent) => {
                  if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                      setIsActionMenuOpen(false);
                  }
              };
              document.addEventListener('mousedown', handleClickOutside);
              return () => {
                  document.removeEventListener('mousedown', handleClickOutside);
              };
          }, []);
          
          if (!views || views.length === 0) return <p className="text-[#8a7e7e] dark:text-[#a89d8d]">Nenhuma visualização 3D disponível.</p>;
          const activeView = views[activeIndex];
      
          const handleActionClick = (action: () => void) => {
              action();
              setIsActionMenuOpen(false);
          };
      
          return (
              <div>
                  <div className="relative group mb-4">
                      <InteractiveImageViewer src={activeView} alt={`Vista 3D ${activeIndex + 1}`} projectName={projectName} />
                       <div ref={actionMenuRef} className="absolute top-2 right-2 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button 
                              onClick={() => setIsActionMenuOpen(prev => !prev)}
                              className="p-2 text-white bg-[#3e3535]/70 hover:bg-[#2d2424]/80 rounded-full"
                              aria-label="Mais ações"
                              aria-haspopup="true"
                              aria-expanded={isActionMenuOpen}
                          >
                              <EllipsisVerticalIcon className="w-5 h-5" />
                          </button>
      
                          {isActionMenuOpen && (
                              <div className="absolute right-0 mt-2 w-56 bg-[#fffefb] dark:bg-[#4a4040] border border-[#e6ddcd] dark:border-[#5a4f4f] rounded-lg shadow-xl p-1 z-20 animate-scaleIn" style={{transformOrigin: 'top right'}} role="menu">
                                  <button onClick={() => handleActionClick(() => onARClick(activeView))} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded text-sm text-[#3e3535] dark:text-[#c7bca9] hover:bg-[#f0e9dc] dark:hover:bg-[#5a4f4f]" role="menuitem">
                                      <ARIcon className="w-4 h-4" /> Ver em RA
                                  </button>
                                  <button onClick={() => handleActionClick(() => onNewViewClick(null, null))} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded text-sm text-[#3e3535] dark:text-[#c7bca9] hover:bg-[#f0e9dc] dark:hover:bg-[#5a4f4f]" role="menuitem">
                                      <WandIcon /> Nova Vista
                                  </button>
                                  <button onClick={() => handleActionClick(() => onNewViewClick('Rústico', 'madeira clara com veios marcantes'))} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded text-sm text-[#3e3535] dark:text-[#c7bca9] hover:bg-[#f0e9dc] dark:hover:bg-[#5a4f4f]" role="menuitem">
                                      <CubeIcon /> Gerar 3D Rústico
                                  </button>
                                  <button
                                        onClick={() => handleActionClick(() => onGenerate3DFrom2DClick('Industrial', 'madeira escura com veios marcantes'))}
                                        disabled={!has2DPlan}
                                        className="w-full text-left flex items-center gap-3 px-3 py-2 rounded text-sm text-[#3e3535] dark:text-[#c7bca9] hover:bg-[#f0e9dc] dark:hover:bg-[#5a4f4f] disabled:opacity-50 disabled:cursor-not-allowed"
                                        role="menuitem"
                                    >
                                        <BlueprintIcon /> Gerar 3D do 2D (Industrial)
                                  </button>
                                  <button onClick={() => handleActionClick(() => onSuggestEditsClick(activeView))} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded text-sm text-[#3e3535] dark:text-[#c7bca9] hover:bg-[#f0e9dc] dark:hover:bg-[#5a4f4f]" role="menuitem">
                                    <SparklesIcon /> Sugerir Edições
                                  </button>
                                  <button onClick={() => handleActionClick(() => onSuggestStylesClick(activeView))} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded text-sm text-[#3e3535] dark:text-[#c7bca9] hover:bg-[#f0e9dc] dark:hover:bg-[#5a4f4f]" role="menuitem">
                                    <SparklesIcon /> Sugerir Estilos
                                  </button>
                                  <button onClick={() => handleActionClick(() => onSuggestFinishesClick(activeView))} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded text-sm text-[#3e3535] dark:text-[#c7bca9] hover:bg-[#f0e9dc] dark:hover:bg-[#5a4f4f]" role="menuitem">
                                    <SparklesIcon /> Sugerir Acabamentos
                                  </button>
                                  <button onClick={() => handleActionClick(() => onEditClick(activeView))} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded text-sm text-[#3e3535] dark:text-[#c7bca9] hover:bg-[#f0e9dc] dark:hover:bg-[#5a4f4f]" role="menuitem">
                                      <WandIcon /> Editar com Iara
                                  </button>
                              </div>
                          )}
                      </div>
                  </div>
                  {views.length > 1 && (
                       <div className="flex gap-2 overflow-x-auto pb-2">
                          {views.map((view, index) => (
                              <button key={index} onClick={() => setActiveIndex(index)} className={`flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-md overflow-hidden border-2 transition-all ${activeIndex === index ? 'border-[#d4ac6e] scale-105' : 'border-transparent hover:border-[#c7bca9]'}`}>
                                  <img src={view} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                              </button>
                          ))}
                      </div>
                  )}
              </div>
          );
      };
      
      const Project2DViewer: React.FC<{
        src: string;
        onEditClick: (src: string) => void;
        onGenerate3DClick: (style: string | null, finish: string | null) => void;
        projectName: string;
      }> = ({ src, onEditClick, onGenerate3DClick, projectName }) => {
          if (!src) return <p className="text-[#8a7e7e] dark:text-[#a89d8d] text-center p-8">Nenhuma planta baixa disponível para este projeto.</p>;
      
          return (
              <div className="animate-fadeIn">
                  <div className="relative group mb-4">
                      <InteractiveImageViewer src={src} alt="Planta baixa 2D" projectName={projectName} />
                      <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onGenerate3DClick('Industrial', 'madeira escura com veios marcantes')} className="text-white bg-[#3e3535]/70 hover:bg-[#2d2424]/80 px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                              <CubeIcon /> Gerar 3D Industrial
                          </button>
                          <button onClick={() => onGenerate3DClick(null, null)} className="text-white bg-[#3e3535]/70 hover:bg-[#2d2424]/80 px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                              <CubeIcon /> Gerar Vista 3D
                          </button>
                          <button onClick={() => onEditClick(src)} className="text-white bg-[#3e3535]/70 hover:bg-[#2d2424]/80 px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                              <WandIcon /> Editar Layout
                          </button>
                      </div>
                  </div>
              </div>
          );
      };
      
      
      // --- NEW EARLY ACCESS PREVIEW COMPONENTS ---
      const EarlyAccessPreviewWrapper: React.FC<{ description: string, children: React.ReactNode }> = ({ description, children }) => (
          <div className="text-left space-y-4">
              <p className="text-lg text-[#6a5f5f] dark:text-[#c7bca9]">{description}</p>
              <div className="p-4 bg-[#f0e9dc] dark:bg-[#2d2424]/50 rounded-lg border border-[#e6ddcd] dark:border-[#4a4040]">
                  {children}
              </div>
          </div>
      );
      
      const AutoPurchaseEarlyAccessPreview: React.FC<{ project: ProjectHistoryItem | null }> = ({ project }) => {
          const [step, setStep] = useState<'initial' | 'searching' | 'results'>('initial');
          useEffect(() => { setStep('initial') }, [project]);
      
          const handleSearch = () => {
              setStep('searching');
              setTimeout(() => setStep('results'), 2000);
          };
      
          if (step === 'searching') {
              return (
                   <EarlyAccessPreviewWrapper description="Gere um carrinho de compras com os melhores preços para a BOM do seu projeto e envie o pedido para seus fornecedores preferidos.">
                      <div className="text-center p-8 flex flex-col items-center justify-center space-y-3">
                          <Spinner />
                          <p className="mt-4 text-[#6a5f5f] dark:text-[#c7bca9]">Buscando melhores preços em Leo Madeiras, GMAD...</p>
                      </div>
                  </EarlyAccessPreviewWrapper>
              )
          }
      
          if (step === 'results') {
              return (
                   <EarlyAccessPreviewWrapper description="Gere um carrinho de compras com os melhores preços para a BOM do seu projeto e envie o pedido para seus fornecedores preferidos.">
                      <div className="space-y-2 text-sm">
                          <h4 className="font-bold text-lg mb-2">Cotação (Simulação)</h4>
                          <div className="flex justify-between p-2 bg-white dark:bg-[#3e3535] rounded"><span>Chapa MDF Branco 18mm</span><span className="font-semibold">Leo Madeiras: R$ 280,00</span></div>
                          <div className="flex justify-between p-2 bg-white dark:bg-[#3e3535] rounded"><span>Corrediça Telescópica 45cm</span><span className="font-semibold">GMAD: R$ 15,00</span></div>
                          <div className="flex justify-between p-2 bg-white dark:bg-[#3e3535] rounded border-t-2 mt-2 pt-2"><strong>Total:</strong><strong className="text-green-600">R$ 295,00</strong></div>
                          <button className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 mt-4">Confirmar Pedido</button>
                      </div>
                  </EarlyAccessPreviewWrapper>
              )
          }
      
          return (
              <EarlyAccessPreviewWrapper description="Gere um carrinho de compras com os melhores preços para a BOM do seu projeto e envie o pedido para seus fornecedores preferidos.">
                  <div className="space-y-2">
                      <p className="font-semibold">Projeto: {project?.name || 'Projeto Exemplo'}</p>
                      <div className="p-2 border rounded max-h-48 overflow-y-auto bg-white dark:bg-[#3e3535]">
                          <pre className="text-xs whitespace-pre-wrap">{project?.bom || 'Gere uma BOM para o projeto primeiro.'}</pre>
                      </div>
                      <button onClick={handleSearch} disabled={!project?.bom} className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50">
                          Buscar Preços e Fazer Pedido
                      </button>
                  </div>
              </EarlyAccessPreviewWrapper>
          );
      };
      
      const EmployeeManagementEarlyAccessPreview: React.FC<{}> = () => (
          <EarlyAccessPreviewWrapper description="Atribua projetos, controle o tempo e gerencie a produtividade da sua equipe.">
              <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-white dark:bg-[#3e3535] rounded">
                      <span>João Silva (Marceneiro)</span>
                      <span className="text-green-600">Ativo</span>
                  </div>
                   <div className="flex justify-between items-center p-2 bg-white dark:bg-[#3e3535] rounded">
                      <span>Maria Costa (Montadora)</span>
                      <span className="text-yellow-600">Em projeto</span>
                  </div>
                  <button className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 mt-2">Adicionar Novo Funcionário</button>
              </div>
          </EarlyAccessPreviewWrapper>
      );
      
      const LearningHubEarlyAccessPreview: React.FC<{}> = () => (
           <EarlyAccessPreviewWrapper description="Acesse tutoriais exclusivos, dicas de especialistas e cursos para aprimorar suas habilidades.">
              <div className="space-y-2">
                  <div className="block text-left w-full p-3 bg-white dark:bg-[#3e3535] rounded hover:bg-gray-50 dark:hover:bg-[#4a4040]">
                      <p className="font-semibold text-purple-600 dark:text-purple-400">[Vídeo] Técnicas Avançadas de Fita de Borda</p>
                      <p className="text-xs">Aprenda a obter um acabamento perfeito em qualquer material.</p>
                  </div>
                  <div className="block text-left w-full p-3 bg-white dark:bg-[#3e3535] rounded hover:bg-gray-50 dark:hover:bg-[#4a4040]">
                      <p className="font-semibold text-purple-600 dark:text-purple-400">[Artigo] Como Calcular Orçamentos Lucrativos</p>
                      <p className="text-xs">Domine a precificação dos seus projetos.</p>
                  </div>
              </EarlyAccessPreviewWrapper>
      );
      
      const EncontraProEarlyAccessPreview: React.FC<{}> = () => (
           <EarlyAccessPreviewWrapper description="Receba notificações de novos clientes buscando por marceneiros qualificados na sua região.">
              <div className="space-y-2">
                  <div className="p-3 border-l-4 border-indigo-500 bg-white dark:bg-[#3e3535] rounded">
                      <p className="font-semibold">Novo Lead: Cozinha Planejada em Moema, SP</p>
                      <p className="text-xs">Cliente busca orçamento para armários de cozinha em L. Contato: (11) 9XXXX-XXXX</p>
                  </div>
                  <button className="w-full bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 mt-2">Ver Painel de Leads</button>
              </div>
          </EarlyAccessPreviewWrapper>
      );
      
      const AREarlyAccessPreview: React.FC<{}> = () => (
          <EarlyAccessPreviewWrapper description="Use a câmera do seu celular para visualizar o projeto em tamanho real no ambiente do seu cliente.">
              <div className="text-center">
                  <p>Abra o <strong>MarcenApp</strong> no seu celular e aponte a câmera para o local desejado.</p>
                  <div className="p-4 my-2 text-3xl">📱</div>
                  <button className="w-full bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600">Iniciar Visualização AR</button>
              </div>
          </EarlyAccessPreviewWrapper>
      );
      
      
      
      // ... Modals ...
      const Generate3DFrom2DModal: React.FC<{isOpen: boolean; onClose: () => void; onGenerate: (style: string, finish: string) => void; project: ProjectHistoryItem; isGenerating: boolean; initialStyle?: string | null; initialFinish?: string | null;}> = ({ isOpen, onClose, onGenerate, project, isGenerating, initialStyle, initialFinish }) => {
          const [style, setStyle] = useState(initialStyle || project.style); 
          const [finish, setFinish] = useState(initialFinish || (project.selectedFinish ? `${project.selectedFinish.finish.name} da ${project.selectedFinish.manufacturer}` : 'madeira clara'));
          useEffect(() => { 
            if (isOpen) { 
                setStyle(initialStyle || project.style); 
                setFinish(initialFinish || (project.selectedFinish ? `${project.selectedFinish.finish.name} da ${project.selectedFinish.manufacturer}` : 'madeira clara')); 
            } 
        }, [isOpen, project, initialStyle, initialFinish]);
          if (!isOpen) return null;
          return (<div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}><div className="bg-[#fffefb] dark:bg-[#4a4040] rounded-lg w-full max-w-2xl max-h-[90vh] shadow-xl border border-[#e6ddcd] dark:border-[#4a4040] flex flex-col" onClick={e => e.stopPropagation()}><header className="p-4 border-b border-[#e6ddcd] dark:border-[#4a4040] flex justify-between items-center"><h2 className="text-xl font-bold text-[#b99256] dark:text-[#d4ac6e] flex items-center gap-2"><CubeIcon /> Gerar 3D a partir da Planta Baixa</h2><button onClick={onClose} className="text-[#a89d8d] hover:text-[#3e3535] dark:hover:text-white text-2xl">&times;</button></header><main className="p-6 flex-grow overflow-y-auto space-y-6"><div><h3 className="text-lg font-semibold text-[#6a5f5f] dark:text-[#c7bca9] mb-2">Planta Baixa de Referência</h3><img src={project.image2d!} alt="Planta baixa" className="w-full max-w-sm mx-auto h-auto object-contain rounded-md bg-white p-1" /></div><div><label htmlFor="style-select" className="block text-sm font-medium text-[#6a5f5f] dark:text-[#c7bca9] mb-2">Estilo de Design</label><select id="style-select" value={style} onChange={(e) => setStyle(e.target.value)} className="w-full bg-[#f0e9dc] dark:bg-[#2d2424] border-2 border-[#e6ddcd] dark:border-[#4a4040] rounded-lg p-3 text-[#3e3535] dark:text-[#f5f1e8] focus:outline-none focus:ring-2 focus:ring-[#d4ac6e] focus:border-[#d4ac6e] transition">{initialStylePresets.map(s => <option key={s} value={s}>{s}</option>)}</select></div><div><label htmlFor="finish-input" className="block text-sm font-medium text-[#6a5f5f] dark:text-[#c7bca9] mb-2">Acabamento Principal</label><input id="finish-input" type="text" value={finish} onChange={(e) => setFinish(e.target.value)} placeholder="Ex: Madeira clara, MDF branco fosco" className="w-full bg-[#f0e9dc] dark:bg-[#2d2424] border-2 border-[#e6ddcd] dark:border-[#4a4040] rounded-lg p-3 text-[#3e3535] dark:text-[#f5f1e8] focus:outline-none focus:ring-2 focus:ring-[#d4ac6e] focus:border-[#d4ac6e] transition" /></div></main><footer className="p-4 border-t border-[#e6ddcd] dark:border-[#4a4040] flex justify-end gap-4"><button onClick={onClose} className="bg-[#8a7e7e] dark:bg-[#5a4f4f] text-white font-bold py-2 px-4 rounded hover:bg-[#6a5f5f] dark:hover:bg-[#4a4040] transition">Cancelar</button><button onClick={() => onGenerate(style, finish)} disabled={isGenerating} className="bg-[#3e3535] dark:bg-[#d4ac6e] text-white dark:text-[#3e3535] font-bold py-2 px-4 rounded hover:bg-[#2d2424] dark:hover:bg-[#c89f5e] transition disabled:opacity-50 flex items-center gap-2">{isGenerating ? <Spinner size="sm" /> : <WandIcon />}{isGenerating ? 'Gerando...' : 'Gerar Visualização 3D'}</button></footer></div></div>);
      };
      const FutureFeatureModal: React.FC<{isOpen: boolean, onClose: () => void, title: string, icon: React.ReactNode}> = ({isOpen, onClose, title, icon}) => {
          if (!isOpen) return null;
          return (<div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}><div className="bg-[#fffefb] dark:bg-[#4a4040] rounded-xl max-w-lg w-full shadow-xl" onClick={e => e.stopPropagation()}><header className="p-4 border-b border-[#e6ddcd] dark:border-[#4a4040] flex justify-between items-center"><h2 className="text-xl font-bold text-[#b99256] dark:text-[#d4ac6e] flex items-center gap-2">{icon} {title}</h2><button onClick={onClose} className="text-[#a89d8d] hover:text-[#3e3535] dark:hover:text-white text-2xl">&times;</button></header><main className="p-6 text-center"><p className="text-lg text-[#6a5f5f] dark:text-[#c7bca9]">Esta funcionalidade está em desenvolvimento e será liberada em breve.</p><p className="text-sm text-[#8a7e7e] dark:text-[#a89d8d] mt-2">Fique de olho nas novidades!</p></main></div></div>);
      };
      const SupplierPricingModal: React.FC<{isOpen: boolean; onClose: () => void; project: ProjectHistoryItem; onUpdateCosts: (newMaterialCost: number) => void; showAlert: (message: string, title?: string) => void;}> = ({ isOpen, onClose, project, onUpdateCosts, showAlert }) => {
          const [pricedItems, setPricedItems] = useState<PricedBomItem[]>([]); 
          const [isParsing, setIsParsing] = useState(true);
          useEffect(() => { const parseBom = async () => { if (isOpen && project.bom) { setIsParsing(true); try { const parsed = await parseBomToList(project.bom); setPricedItems(parsed.map(item => ({ ...item, isSearching: false }))); } catch (error) { showAlert(error instanceof Error ? error.message : "Erro ao analisar BOM.", "Erro"); onClose(); } finally { setIsParsing(false); } } }; parseBom(); }, [isOpen, project.bom, showAlert, onClose]);
          const handleFindPrice = async (index: number) => { const items = [...pricedItems]; items[index].isSearching = true; setPricedItems(items); try { const item = items[index]; const description = `${item.qty} ${item.item} (${item.dimensions})`; const result = await findSupplierPrice(description); items[index] = { ...items[index], ...result, price: result.price }; } catch (error) { showAlert(error instanceof Error ? error.message : "Erro ao buscar preço.", "Erro"); } finally { items[index].isSearching = false; setPricedItems(items); } };
          const newTotalCost = useMemo(() => pricedItems.reduce((total, item) => total + ((parseInt(item.qty.match(/(\d+)/)?.[0] || '1', 10)) * (item.price || 0)), 0), [pricedItems]);
          if (!isOpen) return null;
          return (<div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}><div className="bg-[#fffefb] dark:bg-[#4a4040] rounded-lg w-full max-w-4xl max-h-[90vh] shadow-xl border border-[#e6ddcd] dark:border-[#4a4040] flex flex-col" onClick={e => e.stopPropagation()}><header className="p-4 border-b border-[#e6ddcd] dark:border-[#4a4040] flex justify-between items-center"><h2 className="text-xl font-bold text-[#b99256] dark:text-[#d4ac6e] flex items-center gap-2"><DollarCircleIcon /> Cotação de Preços com Fornecedores</h2><button onClick={onClose} className="text-[#a89d8d] hover:text-[#3e3535] dark:hover:text-white text-2xl">&times;</button></header><main className="p-6 flex-grow overflow-y-auto"><div className="overflow-x-auto"><table className="w-full text-left table-auto"><thead><tr className="border-b-2 border-[#e6ddcd] dark:border-[#4a4040]"><th className="p-2">Item</th><th className="p-2">Qtde</th><th className="p-2">Dimensões</th><th className="p-2">Preço Unit.</th><th className="p-2">Fornecedor</th><th className="p-2">Ação</th></tr></thead><tbody>{isParsing ? (<tr><td colSpan={6} className="text-center p-8"><Spinner /></td></tr>) : (pricedItems.map((item, index) => (<tr key={index} className="border-b border-[#e6ddcd] dark:border-[#4a4040]"><td className="p-2">{item.item}</td><td className="p-2">{item.qty}</td><td className="p-2">{item.dimensions}</td><td className="p-2">{item.price ? `R$ ${item.price.toFixed(2)}` : 'N/A'}</td><td className="p-2">{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline">{item.supplier}</a> : item.supplier || 'N/A'}</td><td className="p-2"><button onClick={() => handleFindPrice(index)} disabled={item.isSearching} className="bg-[#d4ac6e] hover:bg-[#c89f5e] text-[#3e3535] text-sm py-1 px-2 rounded disabled:opacity-50 flex items-center gap-1">{item.isSearching ? 'Buscando' : 'Buscar'}</button></td></tr>)))}</tbody></table></div></main><footer className="p-4 border-t border-[#e6ddcd] dark:border-[#4a4040] flex justify-between items-center"><div className="text-lg">Custo Total dos Materiais: <span className="font-bold text-[#b99256] dark:text-[#d4ac6e]">R$ {newTotalCost.toFixed(2)}</span></div><div className="flex gap-4"><button onClick={onClose} className="bg-[#8a7e7e] dark:bg-[#5a4f4f] text-white font-bold py-2 px-4 rounded hover:bg-[#6a5f5f] dark:hover:bg-[#4a4040] transition">Cancelar</button><button onClick={() => { onUpdateCosts(newTotalCost); onClose(); }} className="bg-[#3e3535] dark:bg-[#d4ac6e] text-white dark:text-[#3e3535] font-bold py-2 px-4 rounded hover:bg-[#2d2424] dark:hover:bg-[#c89f5e] transition">Atualizar Custos</button></div></footer></div></div>);
      };
      
    const StyleSuggestionsModal: React.FC<{
        isOpen: boolean;
        isLoading: boolean;
        suggestions: string[];
        onClose: () => void;
        onSelectSuggestion: (suggestion: string) => void;
        title: string;
    }> = ({ isOpen, isLoading, suggestions, onClose, onSelectSuggestion, title }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
                <div 
                    className="bg-[#fffefb] dark:bg-[#4a4040] rounded-lg w-full max-w-lg shadow-xl border border-[#e6ddcd] dark:border-[#4a4040]"
                    onClick={e => e.stopPropagation()}
                >
                    <header className="p-4 border-b border-[#e6ddcd] dark:border-[#4a4040] flex justify-between items-center">
                        <h2 className="text-xl font-bold text-[#b99256] dark:text-[#d4ac6e] flex items-center gap-2">
                            <SparklesIcon /> {title}
                        </h2>
                        <button onClick={onClose} className="text-[#a89d8d] hover:text-[#3e3535] dark:hover:text-white text-2xl">&times;</button>
                    </header>
                    <main className="p-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-48">
                                <Spinner />
                                <p className="mt-4 text-[#8a7e7e] dark:text-[#a89d8d]">Iara está pensando nas melhores sugestões...</p>
                            </div>
                        ) : suggestions.length > 0 ? (
                            <div className="space-y-3">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => onSelectSuggestion(suggestion)}
                                        className="w-full text-left bg-[#f0e9dc] dark:bg-[#3e3535] text-[#3e3535] dark:text-[#f5f1e8] p-4 rounded-lg hover:bg-[#e6ddcd] dark:hover:bg-[#5a4f4f] transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        ) : (
                             <p className="text-center text-[#8a7e7e] dark:text-[#a89d8d]">Nenhuma sugestão foi gerada. Tente novamente.</p>
                        )}
                    </main>
                </div>
            </div>
        );
    };

    // NEW: SuggestedFinishesModal component (similar to StyleSuggestionsModal)
    const SuggestedFinishesModal: React.FC<{
        isOpen: boolean;
        isLoading: boolean;
        suggestions: Finish[];
        onClose: () => void;
        onSelectSuggestion: (finish: Finish) => void;
        title: string;
    }> = ({ isOpen, isLoading, suggestions, onClose, onSelectSuggestion, title }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose}>
                <div 
                    className="bg-[#fffefb] dark:bg-[#4a4040] rounded-lg w-full max-w-2xl shadow-xl border border-[#e6ddcd] dark:border-[#4a4040]"
                    onClick={e => e.stopPropagation()}
                >
                    <header className="p-4 border-b border-[#e6ddcd] dark:border-[#4a4040] flex justify-between items-center">
                        <h2 className="text-xl font-bold text-[#b99256] dark:text-[#d4ac6e] flex items-center gap-2">
                            <SparklesIcon /> {title}
                        </h2>
                        <button onClick={onClose} className="text-[#a89d8d] hover:text-[#3e3535] dark:hover:text-white text-2xl">&times;</button>
                    </header>
                    <main className="p-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-48">
                                <Spinner />
                                <p className="mt-4 text-[#8a7e7e] dark:text-[#a89d8d]">Iara está pensando nas melhores opções de acabamento...</p>
                            </div>
                        ) : suggestions.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {suggestions.map(finish => (
                                    <button
                                        key={finish.id}
                                        onClick={() => onSelectSuggestion(finish)}
                                        className="bg-[#f0e9dc] dark:bg-[#3e3535] rounded-lg text-left border border-[#e6ddcd] dark:border-[#5a4f4f] hover:border-[#d4ac6e] dark:hover:border-[#d4ac6e] transition-all duration-200 h-full flex flex-col overflow-hidden group"
                                    >
                                        <div className="w-full h-24 bg-[#e6ddcd] dark:bg-[#2d2424] overflow-hidden">
                                            {finish.imageUrl && (
                                                <img 
                                                    src={finish.imageUrl} 
                                                    alt={finish.name} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        const parent = target.parentElement;
                                                        if (parent) {
                                                            const textDiv = document.createElement('div');
                                                            textDiv.className = 'w-full h-full flex items-center justify-center text-xs text-[#8a7e7e] dark:text-[#a89d8d] p-2 text-center';
                                                            textDiv.innerText = finish.name;
                                                            parent.appendChild(textDiv);
                                                        }
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div className="p-3 flex flex-col justify-between flex-grow">
                                            <div className="font-semibold text-[#3e3535] dark:text-[#f5f1e8] text-sm truncate">{finish.name}</div>
                                            <div className="text-xs text-[#6a5f5f] dark:text-[#c7bca9] mt-1 h-8 line-clamp-2">{finish.description}</div>
                                            <div className="text-xs text-[#8a7e7e] dark:text-[#a89d8d] mt-2 font-medium self-end">{finish.manufacturer}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                             <p className="text-center text-[#8a7e7e] dark:text-[#a89d8d]">Nenhuma sugestão foi gerada. Tente novamente.</p>
                        )}
                    </main>
                </div>
            </div>
        );
    };


    return (
        <div className={`min-h-screen bg-[#f5f1e8] dark:bg-[#2d2424] text-[#3e3535] dark:text-[#f5f1e8] transition-colors duration-300`}>
            <Header
                userEmail={userEmail}
                isAdmin={isAdmin}
                onOpenResearch={() => setIsResearchAssistantOpen(true)}
                onOpenLive={() => setIsLiveAssistantOpen(true)}
                onOpenDistributors={() => setIsDistributorFinderOpen(true)}
                onOpenClients={() => setIsClientPanelOpen(true)}
                onOpenHistory={() => setIsHistoryPanelOpen(true)}
                onOpenAbout={() => setIsAboutModalOpen(true)}
                onOpenBomGenerator={() => currentProject ? setIsBomGeneratorModalOpen(true) : showAlert('Selecione ou gere um projeto primeiro.')}
                onOpenCuttingPlanGenerator={() => currentProject ? setIsCuttingPlanGeneratorModalOpen(true) : showAlert('Selecione ou gere um projeto primeiro.')}
                onOpenCostEstimator={() => currentProject ? setIsCostEstimatorModalOpen(true) : showAlert('Selecione ou gere um projeto primeiro.')}
                onOpenWhatsapp={() => currentProject ? setIsWhatsappModalOpen(true) : showAlert('Selecione um projeto para usar esta função.')}
                onOpenAutoPurchase={() => setIsAutoPurchaseModalOpen(true)}
                onOpenEmployeeManagement={() => setIsEmployeeManagementModalOpen(true)}
                onOpenLearningHub={() => setIsLearningHubModalOpen(true)}
                onOpenEncontraPro={() => setIsEncontraProModalOpen(true)}
                onOpenAR={() => setIsAutoPurchaseModalOpen(true)}
                onOpenAdmin={() => setIsAdminView(true)}
                onOpenPerformance={() => setIsPerformanceModalOpen(true)}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onLogout={onLogout}
                theme={theme}
                setTheme={setTheme}
            />

            {isAdminView ? <DashboardAdmin onNavigateBack={() => setIsAdminView(false)} clients={clients} onUpdateClientStatus={async (id, status) => setClients(await saveClient({ ...clients.find(c => c.id === id)!, id, status}))} onDeleteClient={async (id) => setClients(await removeClient(id))}/> : (
                <>
                    <LeadNotification />
                    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-2 gap-8 items-start">
                            {/* Left Column: Project Creation */}
                            <div className="lg:col-span-1 xl:col-span-1 space-y-6">
                                <div className="bg-[#fffefb] dark:bg-[#4a4040] p-6 rounded-lg shadow-lg border border-[#e6ddcd] dark:border-[#5a4f4f]">
                                    <h2 className="text-2xl font-semibold mb-4 text-[#3e3535] dark:text-[#f5f1e8]">{t('new_project')}</h2>
                                    <form onSubmit={handleGenerateProject} className="space-y-6">
                                        {/* Step 1 */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-[#6a5f5f] dark:text-[#c7bca9] mb-3">{t('step_1')}</h3>
                                            <div className="space-y-4">
                                                <select
                                                    value={projectPreset}
                                                    onChange={(e) => handleSelectPreset(e.target.value)}
                                                    className="w-full bg-[#f0e9dc] dark:bg-[#2d2424] border-2 border-[#e6ddcd] dark:border-[#4a4040] rounded-lg p-3 text-[#3e3535] dark:text-[#f5f1e8] focus:outline-none focus:ring-2 focus:ring-[#d4ac6e] focus:border-[#d4ac6e] transition"
                                                >
                                                    {projectTypePresets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                                <div className="relative">
                                                    <textarea
                                                        rows={5}
                                                        value={projectDescription}
                                                        onChange={(e) => setProjectDescription(e.target.value)}
                                                        placeholder="Ex: Armário de cozinha em L com 3 portas..."
                                                        className="w-full bg-[#f0e9dc] dark:bg-[#2d2424] border-2 border-[#e6ddcd] dark:border-[#4a4040] rounded-lg p-3 pr-12 text-[#3e3535] dark:text-[#f5f1e8] focus:outline-none focus:ring-2 focus:ring-[#d4ac6e] focus:border-[#d4ac6e] transition"
                                                    />
                                                    <div className="absolute top-3 right-3">
                                                        <VoiceInputButton onRecordingStart={clearForm} onTranscriptUpdate={handleRecordingUpdate} showAlert={showAlert} />
                                                    </div>
                                                </div>
                                                <ImageUploader onImagesChange={setUploadedImages} showAlert={showAlert} />
                                                <StyleAssistant onSelect={handleStyleTagSelect} presetId={projectPreset} />
                                            </div>
                                        </div>

                                        {/* Step 2 */}
                                        <div>
                                            <FinishesSelector onFinishSelect={setSelectedFinish} value={selectedFinish} showAlert={showAlert} favoriteFinishes={favoriteFinishes} onToggleFavorite={handleToggleFavoriteFinish} />
                                        </div>

                                        {/* Step 3 */}
                                        <div>
                                            <h3 className="text-2xl font-semibold mb-4 text-[#3e3535] dark:text-[#f5f1e8]">{t('step_3')}</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-[#6a5f5f] dark:text-[#c7bca9] mb-2">Estilo de Design</label>
                                                    <select
                                                        value={selectedStyle}
                                                        onChange={(e) => setSelectedStyle(e.target.value)}
                                                        className="w-full bg-[#f0e9dc] dark:bg-[#2d2424] border-2 border-[#e6ddcd] dark:border-[#4a4040] rounded-lg p-3 text-[#3e3535] dark:text-[#f5f1e8] focus:outline-none focus:ring-2 focus:ring-[#d4ac6e] focus:border-[#d4ac6e] transition"
                                                    >
                                                        {initialStylePresets.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#d4ac6e] to-[#b99256] text-[#3e3535] font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center gap-2 disabled:opacity-70">
                                                    {isLoading ? <><Spinner size="sm" /> {t('generating')}</> : <><SparklesIcon /> {t('generate_project_with_iara')}</>}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Right Column: Project Viewer */}
                            <div className="lg:col-span-2 xl:col-span-1">
                                {isLoading && (
                                    <div className="flex flex-col items-center justify-center h-96 bg-[#fffefb] dark:bg-[#4a4040] rounded-lg shadow-lg border border-[#e6ddcd] dark:border-[#5a4f4f]">
                                        <Spinner size="lg" />
                                        <p className="mt-4 text-[#6a5f5f] dark:text-[#c7bca9] animate-pulse">Iara está criando seu projeto...</p>
                                    </div>
                                )}
                                {!isLoading && currentProject && (
                                    <div className="bg-[#fffefb] dark:bg-[#4a4040] p-6 rounded-lg shadow-lg border border-[#e6ddcd] dark:border-[#5a4f4f] animate-fadeIn">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2"> {/* New wrapper for name, style, and favorite button */}
                                                <div>
                                                    <h2 className="text-2xl font-bold text-[#b99256] dark:text-[#d4ac6e]">{currentProject.name}</h2>
                                                    <p className="text-sm text-[#8a7e7e] dark:text-[#a89d8d]">{currentProject.style}</p>
                                                </div>
                                                {currentProject.selectedFinish && (
                                                    <button
                                                        onClick={() => handleToggleFavoriteFinish(currentProject.selectedFinish!.finish)}
                                                        className="p-1 rounded-full text-yellow-400 hover:bg-black/10 transition"
                                                        title={isCurrentProjectFinishFavorite ? "Remover acabamento do projeto atual dos favoritos" : "Adicionar acabamento do projeto atual aos favoritos"}
                                                        aria-label={isCurrentProjectFinishFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                                    >
                                                        <StarIcon isFavorite={isCurrentProjectFinishFavorite} className="w-6 h-6"/>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 border border-[#e6ddcd] dark:border-[#5a4f4f] p-1 rounded-full">
                                                <button onClick={() => setViewMode('3d')} className={`px-4 py-1 rounded-full text-sm font-semibold transition ${viewMode === '3d' ? 'bg-[#d4ac6e] text-[#3e3535]' : 'text-[#6a5f5f] dark:text-[#c7bca9]'}`}>3D</button>
                                                <button onClick={() => setViewMode('2d')} className={`px-4 py-1 rounded-full text-sm font-semibold transition ${viewMode === '2d' ? 'bg-[#d4ac6e] text-[#3e3535]' : 'text-[#6a5f5f] dark:text-[#c7bca9]'}`} disabled={!currentProject.image2d}>2D</button>
                                            </div>
                                        </div>
                                        
                                        {viewMode === '3d' ? (
                                            <Project3DViewer views={currentProject.views3d} onEditClick={(src) => setImageEditorState({isOpen: true, src})} onARClick={(src) => setArViewerState({isOpen: true, src})} onNewViewClick={handleOpenNewViewModal} onSuggestEditsClick={handleOpenEditSuggestions} onSuggestStylesClick={handleOpenProjectStyleSuggestions} onSuggestFinishesClick={handleOpenFinishSuggestions} onGenerate3DFrom2DClick={handleOpenGenerate3DFrom2DModal} projectName={currentProject.name} has2DPlan={!!currentProject.image2d} />
                                        ) : (
                                            <Project2DViewer src={currentProject.image2d!} onEditClick={(src) => setLayoutEditorState({isOpen: true, src})} onGenerate3DClick={handleOpenGenerate3DFrom2DModal} projectName={currentProject.name}/>
                                        )}
                                        
                                        <div className="mt-6 pt-6 border-t border-[#e6ddcd] dark:border-[#5a4f4f]">
                                            <h3 className="text-lg font-semibold text-[#6a5f5f] dark:text-[#c7bca9] mb-4">Ferramentas do Projeto</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                 <button onClick={handleGenerateFloorPlan} disabled={isLoading || !!currentProject.image2d} className="flex flex-col items-center justify-center p-3 bg-[#f0e9dc] dark:bg-[#3e3535] rounded-lg hover:bg-[#e6ddcd] dark:hover:bg-[#5a4f4f] transition disabled:opacity-50 text-center"><BlueprintIcon /> <span className="text-xs mt-1 font-semibold">{currentProject.image2d ? 'Planta 2D Gerada' : 'Gerar Planta 2D'}</span></button>
                                                 <button onClick={() => setIsBomGeneratorModalOpen(true)} className="flex flex-col items-center justify-center p-3 bg-[#f0e9dc] dark:bg-[#3e3535] rounded-lg hover:bg-[#e6ddcd] dark:hover:bg-[#5a4f4f] transition text-center"><BookIcon /> <span className="text-xs mt-1 font-semibold">BOM</span></button>
                                                 <button onClick={() => setIsCuttingPlanGeneratorModalOpen(true)} className="flex flex-col items-center justify-center p-3 bg-[#f0e9dc] dark:bg-[#3e3535] rounded-lg hover:bg-[#e6ddcd] dark:hover:bg-[#5a4f4f] transition text-center"><ToolsIcon /> <span className="text-xs mt-1 font-semibold">Plano de Corte</span></button>
                                                 <button onClick={handleGenerateAssemblyDetails} className="flex flex-col items-center justify-center p-3 bg-[#f0e9dc] dark:bg-[#3e3535] rounded-lg hover:bg-[#e6ddcd] dark:hover:bg-[#5a4f4f] transition text-center"><ToolsIcon /> <span className="text-xs mt-1 font-semibold">Montagem</span></button>
                                                 <button onClick={() => setIsCostEstimatorModalOpen(true)} className="flex flex-col items-center justify-center p-3 bg-[#f0e9dc] dark:bg-[#3e3535] rounded-lg hover:bg-[#e6ddcd] dark:hover:bg-[#5a4f4f] transition text-center"><CurrencyDollarIcon /> <span className="text-xs mt-1 font-semibold">Custos</span></button>
                                            </div>
                                            <button onClick={() => setIsProposalModalOpen(true)} className="w-full mt-4 bg-[#3e3535] dark:bg-[#d4ac6e] text-white dark:text-[#3e3535] font-bold py-3 px-4 rounded-lg hover:bg-[#2d2424] dark:hover:bg-[#c89f5e] transition">{t('generate_proposal')}</button>
                                        </div>
                                    </div>
                                )}
                                {!isLoading && !currentProject && (
                                     <div className="flex flex-col items-center justify-center h-96 bg-[#fffefb] dark:bg-[#4a4040] rounded-lg shadow-lg border border-[#e6ddcd] dark:border-[#5a4f4f] p-8 text-center">
                                         <LogoIcon className="w-16 h-16 text-[#b99256] dark:text-[#d4ac6e] mb-4" />
                                         <h2 className="text-2xl font-bold font-serif text-[#3e3535] dark:text-[#f5f1e8]">Bem-vindo ao MarcenApp</h2>
                                         <p className="text-[#6a5f5f] dark:text-[#c7bca9] mt-2">Use o painel à esquerda para criar seu primeiro projeto ou carregue um projeto existente do seu histórico.</p>
                                     </div>
                                )}
                            </div>
                        </div>
                    </main>
                </>
            )}

            {/* Modals & Panels */}
            <AlertModal state={alert} onClose={() => setAlert({ ...alert, show: false })} />
            <ImageModal state={imageModal} onClose={() => setImageModal({ ...imageModal, show: false })} />
            <ConfirmationModal 
                show={confirmationModal.show} 
                title={confirmationModal.title} 
                message={confirmationModal.message}
                onConfirm={confirmationModal.onConfirm}
                onCancel={() => setConfirmationModal({ ...confirmationModal, show: false })} 
            />
            <HistoryPanel isOpen={isHistoryPanelOpen} onClose={() => setIsHistoryPanelOpen(false)} history={history} onViewProject={handleViewProject} onAddNewView={(id) => { const p = history.find(h => h.id === id); if (p) { setCurrentProject(p); handleOpenNewViewModal(null, null); }}} onDeleteProject={handleDeleteProject}/>
            <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
            <LiveAssistant isOpen={isLiveAssistantOpen} onClose={() => setIsLiveAssistantOpen(false)} showAlert={showAlert} />
            <ResearchAssistant isOpen={isResearchAssistantOpen} onClose={() => setIsResearchAssistantOpen(false)} showAlert={showAlert} />
            <DistributorFinder isOpen={isDistributorFinderOpen} onClose={() => setIsDistributorFinderOpen(false)} showAlert={showAlert} />
            {/* Removed 'projects' prop from ClientPanel because 'clients' are now 'marceneiros' and projects are for end-clients */}
            <ClientPanel isOpen={isClientPanelOpen} onClose={() => setIsClientPanelOpen(false)} clients={clients.filter(c => c.status !== 'waitlist')} onSaveClient={async (c) => setClients(await saveClient(c))} onDeleteClient={async (id) => setClients(await removeClient(id))} />
            {currentProject && <ImageEditor isOpen={imageEditorState.isOpen} imageSrc={imageEditorState.src} projectDescription={currentProject.description} onClose={() => setImageEditorState({isOpen: false, src: ''})} onSave={handleSaveEditedImage} showAlert={showAlert} initialPrompt={imageEditorState.initialPrompt} />}
            {currentProject && <LayoutEditor isOpen={layoutEditorState.isOpen} floorPlanSrc={layoutEditorState.src} projectDescription={currentProject.description} onClose={() => setLayoutEditorState({isOpen: false, src: ''})} onSave={handleSaveEditedLayout} showAlert={showAlert} />}
            {/* Pass currentProject directly to ProposalModal and WhatsappSenderModal */}
            {currentProject && <ProposalModal isOpen={isProposalModalOpen} onClose={() => setIsProposalModalOpen(false)} project={currentProject} showAlert={showAlert} />}
            {currentProject && <NewViewGenerator isOpen={isNewViewModalOpen} onClose={() => setIsNewViewModalOpen(false)} project={currentProject} onSaveComplete={async () => setHistory(await getHistory())} showAlert={showAlert} initialStyle={newViewInitialStyle} initialFinish={newViewInitialFinish} />}
            {currentProject && <BomGeneratorModal isOpen={isBomGeneratorModalOpen} onClose={() => setIsBomGeneratorModalOpen(false)} showAlert={showAlert} project={currentProject} onSave={handleSaveBom} />}
            {currentProject && <CuttingPlanGeneratorModal isOpen={isCuttingPlanGeneratorModalOpen} onClose={() => setIsCuttingPlanGeneratorModalOpen(false)} showAlert={showAlert} project={currentProject} onSave={handleSaveCuttingPlan} />}
            {currentProject && <CostEstimatorModal isOpen={isCostEstimatorModalOpen} onClose={() => setIsCostEstimatorModalOpen(false)} showAlert={showAlert} />}
            <ARViewer isOpen={arViewerState.isOpen} onClose={() => setArViewerState({ isOpen: false, src: '' })} imageSrc={arViewerState.src} showAlert={showAlert} />
            <EncontraProModal isOpen={isEncontraProModalOpen} onClose={() => setIsEncontraProModalOpen(false)} showAlert={showAlert} />
            <PerformanceModal isOpen={isPerformanceModalOpen} onClose={() => setIsPerformanceModalOpen(false)} userEmail={userEmail} showAlert={showAlert} />
            {/* Pass currentProject directly to WhatsappSenderModal */}
            {currentProject && <WhatsappSenderModal isOpen={isWhatsappModalOpen} onClose={() => setIsWhatsappModalOpen(false)} project={currentProject} showAlert={showAlert} />}
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} showAlert={showAlert} />
            {currentProject && currentProject.image2d && (
                <Generate3DFrom2DModal
                    isOpen={is3DFrom2DModalOpen}
                    onClose={() => setIs3DFrom2DModalOpen(false)}
                    onGenerate={handleGenerate3DFrom2D}
                    project={currentProject}
                    isGenerating={isGenerating3D}
                    initialStyle={modal3DFrom2DInitialStyle}
                    initialFinish={modal3DFrom2DInitialFinish}
                />
            )}
             <StyleSuggestionsModal
                isOpen={isSuggestionsModalOpen}
                isLoading={isSuggestingEdits}
                suggestions={editSuggestions}
                onClose={() => setIsSuggestionsModalOpen(false)}
                onSelectSuggestion={handleSelectSuggestion}
                title="Sugestões da Iara"
            />
            {/* New Style Suggestions Modal */}
            <StyleSuggestionsModal
                isOpen={isStyleSuggestionsModalOpen}
                isLoading={isFetchingStyleSuggestions}
                suggestions={suggestedStylesForCurrentProject}
                onClose={() => setIsStyleSuggestionsModalOpen(false)}
                onSelectSuggestion={handleSelectSuggestedStyle}
                title="Sugestões de Estilo da Iara"
            />
            {/* NEW: Suggested Finishes Modal */}
            <SuggestedFinishesModal
                isOpen={isSuggestedFinishesModalOpen}
                isLoading={isFetchingFinishSuggestions}
                suggestions={suggestedFinishesForCurrentProject}
                onClose={() => setIsSuggestedFinishesModalOpen(false)}
                onSelectSuggestion={handleSelectFinishSuggestion}
                title="Sugestões de Acabamento da Iara"
            />


            {/* Assembly Details Modal */}
            {currentProject && (
                <AssemblyDetailsModal
                    isOpen={isAssemblyDetailsModalOpen}
                    onClose={() => setIsAssemblyDetailsModalOpen(false)}
                    showAlert={showAlert}
                    project={currentProject}
                    assemblyDetails={assemblyDetails}
                    isGenerating={isGeneratingAssemblyDetails}
                    onGenerate={handleGenerateAssemblyDetails}
                    onSave={handleSaveAssemblyDetails}
                />
            )}

            {/* Early Access Modals */}
             <EarlyAccessModal isOpen={isAutoPurchaseModalOpen} onClose={() => setIsAutoPurchaseModalOpen(false)} title="Compra Automática de Materiais">
                <AutoPurchaseEarlyAccessPreview project={currentProject} />
            </EarlyAccessModal>
            <EarlyAccessModal isOpen={isEmployeeManagementModalOpen} onClose={() => setIsEmployeeManagementModalOpen(false)} title="Gestão de Equipe">
                <EmployeeManagementEarlyAccessPreview />
            </EarlyAccessModal>
            <EarlyAccessModal isOpen={isLearningHubModalOpen} onClose={() => setIsLearningHubModalOpen(false)} title="Hub de Aprendizagem">
                <LearningHubEarlyAccessPreview />
            </EarlyAccessModal>

        </div>
    );
}