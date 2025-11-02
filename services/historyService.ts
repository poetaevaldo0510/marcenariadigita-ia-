import type { ProjectHistoryItem, Client, Finish } from '../types.ts';

const DB_NAME = 'MarcenAppDB';
const PROJECTS_STORE_NAME = 'projects';
const CLIENTS_STORE_NAME = 'clients';
const FAVORITE_FINISHES_STORE_NAME = 'favoriteFinishes';
const DB_VERSION = 4; // Incremented version

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROJECTS_STORE_NAME)) {
        db.createObjectStore(PROJECTS_STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CLIENTS_STORE_NAME)) {
        db.createObjectStore(CLIENTS_STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(FAVORITE_FINISHES_STORE_NAME)) {
        db.createObjectStore(FAVORITE_FINISHES_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

// --- PROJECT HISTORY FUNCTIONS ---

export const getHistory = async (): Promise<ProjectHistoryItem[]> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROJECTS_STORE_NAME, 'readonly');
    const store = tx.objectStore(PROJECTS_STORE_NAME);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const projects: ProjectHistoryItem[] = request.result;
      resolve(projects.sort((a, b) => b.timestamp - a.timestamp));
    };
  });
};

export const addProjectToHistory = async (project: Omit<ProjectHistoryItem, 'id' | 'timestamp'>): Promise<ProjectHistoryItem[]> => {
    const newProject: ProjectHistoryItem = {
        ...project,
        id: `proj_${Date.now()}`,
        timestamp: Date.now(),
        // Initialize new fields
        endClientName: project.endClientName || undefined,
        endClientPhone: project.endClientPhone || undefined,
    };
    const db = await openDb();
    const tx = db.transaction(PROJECTS_STORE_NAME, 'readwrite');
    tx.objectStore(PROJECTS_STORE_NAME).put(newProject);
    await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    return getHistory();
};

export const removeProjectFromHistory = async (id: string): Promise<ProjectHistoryItem[]> => {
    const db = await openDb();
    const tx = db.transaction(PROJECTS_STORE_NAME, 'readwrite');
    tx.objectStore(PROJECTS_STORE_NAME).delete(id);
    await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    return getHistory();
};

export const updateProjectInHistory = async (id: string, updates: Partial<ProjectHistoryItem>): Promise<ProjectHistoryItem | null> => {
    const db = await openDb();
    const tx = db.transaction(PROJECTS_STORE_NAME, 'readwrite');
    const store = tx.objectStore(PROJECTS_STORE_NAME);
    const project = await new Promise<ProjectHistoryItem | undefined>((resolve, reject) => {
        const request = store.get(id);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
    if (!project) return null;
    const updatedProject = { ...project, ...updates };
    store.put(updatedProject);
    await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    return updatedProject;
};


// --- CLIENT (MARCENEIRO) FUNCTIONS ---

export const getClients = async (): Promise<Client[]> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CLIENTS_STORE_NAME, 'readonly');
    const store = tx.objectStore(CLIENTS_STORE_NAME);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const clients: Client[] = request.result;
      if (clients.length === 0) {
        // Pre-populate with test *marceneiro* clients if none exist
        const testCarpenters: Client[] = [
          {
            id: 'marceneiro_1',
            timestamp: Date.now() - 86400000 * 30, // 30 days ago
            name: 'Marcenaria Arte & Design',
            phone: '5511987654321',
            email: 'contato@artedesign.com.br',
            address: 'Rua da Madeira, 123, Bairro dos Carpinteiros, São Paulo - SP',
            city: 'São Paulo', // Added city
            notes: 'Especializada em móveis de alto padrão. Busca otimizar orçamentos.',
            status: 'active',
            feedback: 'A funcionalidade de geração de 3D fotorrealista da Iara é um divisor de águas para nós. Conseguimos fechar mais vendas porque o cliente visualiza exatamente o resultado. A principal dor era a demora na aprovação do design.'
          },
          {
            id: 'marceneiro_2',
            timestamp: Date.now() - 86400000 * 15, // 15 days ago
            name: 'Móveis do Gustavo Ltda.',
            phone: '5521912345678',
            email: 'gustavo.moveis@example.com',
            address: 'Av. Serralheria, 456, Tijuca, Rio de Janeiro - RJ',
            city: 'Rio de Janeiro', // Added city
            notes: 'Pequena marcenaria, busca eficiência na produção. Tem dificuldades com planos de corte manuais.',
            status: 'lead',
            feedback: 'O plano de corte otimizado da Iara economiza muito tempo e material. Antes perdíamos chapas e tempo calculando. Esse produto resolve a dor de otimização de custo e tempo na fase de corte.'
          },
          {
            id: 'marceneiro_3',
            timestamp: Date.now() - 86400000 * 5, // 5 days ago
            name: 'Carolina Design de Interiores',
            phone: '5531955554444',
            email: 'carolina.design@example.com',
            address: 'Rua do Conceito, 789, Lourdes, Belo Horizonte - MG',
            city: 'Belo Horizonte', // Added city
            notes: 'Designer de interiores que faz móveis sob medida. Valoriza a apresentação visual para clientes.',
            status: 'on-hold',
            feedback: 'As sugestões de acabamento e estilo da Iara são muito úteis para dar novas ideias aos clientes e agilizar a escolha. Minha dor era a limitação criativa e a dificuldade em apresentar opções variadas sem gastar muito tempo.'
          },
          {
            id: 'waitlist_1',
            timestamp: Date.now() - 86400000 * 1, // 1 day ago
            name: 'Nova Marcenaria Criativa',
            phone: '5541977778888',
            email: 'novo.contato@criativa.com.br',
            city: 'Curitiba',
            motivation: 'Estou começando minha marcenaria e preciso de ferramentas para gerar projetos 3D rapidamente e otimizar meus custos. O MarcenApp parece perfeito para isso, especialmente o plano de corte e a estimativa de custos.',
            status: 'waitlist',
          },
          {
            id: 'waitlist_2',
            timestamp: Date.now() - 86400000 * 0.5, // 12 hours ago
            name: 'Móveis Sob Medida SP',
            phone: '5511911112222',
            email: 'contato@moveissp.com',
            city: 'São Paulo',
            motivation: 'Tenho dificuldade em apresentar visuais realistas para meus clientes e perco tempo na confecção de propostas. A geração 3D e a proposta em PDF são funcionalidades que mais me interessam.',
            status: 'waitlist',
          }
        ];
        // Add test clients to the store
        const addTx = db.transaction(CLIENTS_STORE_NAME, 'readwrite');
        const addStore = addTx.objectStore(CLIENTS_STORE_NAME);
        testCarpenters.forEach(client => addStore.put(client));
        addTx.oncomplete = () => resolve(testCarpenters.sort((a, b) => b.timestamp - a.timestamp));
        addTx.onerror = () => reject(addTx.error);
      } else {
        resolve(clients.sort((a, b) => b.timestamp - a.timestamp));
      }
    };
  });
};

export const saveClient = async (client: Omit<Client, 'id' | 'timestamp'> & { id?: string }): Promise<Client[]> => {
    const clientToSave: Client = {
        ...client,
        id: client.id || `client_${Date.now()}`,
        timestamp: Date.now(),
        // Ensure new fields are properly initialized/persisted
        city: client.city || undefined,
        motivation: client.motivation || undefined,
    };
    const db = await openDb();
    const tx = db.transaction(CLIENTS_STORE_NAME, 'readwrite');
    tx.objectStore(CLIENTS_STORE_NAME).put(clientToSave);
    await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    return getClients();
};

export const removeClient = async (id: string): Promise<Client[]> => {
    const db = await openDb();
    const tx = db.transaction(CLIENTS_STORE_NAME, 'readwrite');
    tx.objectStore(CLIENTS_STORE_NAME).delete(id);
    await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    return getClients();
};

// --- FAVORITE FINISHES FUNCTIONS ---

export const getFavoriteFinishes = async (): Promise<Finish[]> => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(FAVORITE_FINISHES_STORE_NAME, 'readonly');
        const store = tx.objectStore(FAVORITE_FINISHES_STORE_NAME);
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            resolve(request.result || []);
        };
    });
};

export const addFavoriteFinish = async (finish: Finish): Promise<Finish[]> => {
    const db = await openDb();
    const tx = db.transaction(FAVORITE_FINISHES_STORE_NAME, 'readwrite');
    tx.objectStore(FAVORITE_FINISHES_STORE_NAME).put(finish);
    await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    return getFavoriteFinishes();
};

export const removeFavoriteFinish = async (id: string): Promise<Finish[]> => {
    const db = await openDb();
    const tx = db.transaction(FAVORITE_FINISHES_STORE_NAME, 'readwrite');
    tx.objectStore(FAVORITE_FINISHES_STORE_NAME).delete(id);
    await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
    return getFavoriteFinishes();
};