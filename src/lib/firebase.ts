// Importa as funções necessárias do Firebase para inicializar o app e interagir com Firestore e Authentication
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, // Inicializa Firestore
  collection,   // Obtém uma referência a uma coleção
  addDoc,       // Adiciona um documento a uma coleção
  query,        // Cria uma consulta ao Firestore
  where,        // Filtra os documentos com base em condições
  getDocs,      // Obtém documentos de uma coleção com base em uma consulta
  deleteDoc,    // Deleta um documento do Firestore
  doc,          // Obtém uma referência a um documento específico
  updateDoc,    // Atualiza um documento existente
  Firestore,    // Tipo do Firestore para tipagem TypeScript
  DocumentData, // Tipo para representar os dados de um documento
  QuerySnapshot // Tipo para representar os resultados de uma consulta
} from 'firebase/firestore';

import { getAuth } from 'firebase/auth'; // Importa autenticação do Firebase
import { TimeSlot } from '@/types/user'; // Importa o tipo TimeSlot (definido no projeto)

// Configuração do Firebase com variáveis de ambiente (import.meta.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Inicializa o Firebase app com a configuração fornecida
const app = initializeApp(firebaseConfig);

// Obtém instâncias do Firestore e da autenticação
export const db = getFirestore(app);
export const auth = getAuth(app);

// Função auxiliar para clonar dados do Firestore de forma segura
const safeClone = (data: DocumentData): Record<string, any> => {
  const serializableData: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    // Ignora funções ou fluxos de leitura (ReadableStream)
    if (typeof value === 'function' || value instanceof ReadableStream) {
      continue;
    }
    
    // Converte datas para string no formato ISO
    if (value instanceof Date) {
      serializableData[key] = value.toISOString();
      continue;
    }

    // Se for um array, clona cada item recursivamente
    if (Array.isArray(value)) {
      serializableData[key] = value.map(item => 
        typeof item === 'object' && item !== null ? safeClone(item) : item
      );
      continue;
    }

    // Se for um objeto, clona recursivamente
    if (typeof value === 'object' && value !== null) {
      serializableData[key] = safeClone(value);
      continue;
    }

    // Atribui valores diretamente se não forem funções, datas ou objetos
    serializableData[key] = value;
  }

  return serializableData;
};

// Função auxiliar para converter um QuerySnapshot em um array de TimeSlots
const getDocsFromSnapshot = (snapshot: QuerySnapshot): TimeSlot[] => {
  return snapshot.docs.map(doc => ({
    id: doc.id,                   // Adiciona o ID do documento ao objeto
    title: doc.data().title || '', // Garante que há um título
    description: doc.data().description || '', // Garante que há uma descrição
    date: doc.data().date || '',   // Garante que há uma data
    ...safeClone(doc.data())       // Clona os dados do documento para evitar problemas de serialização
  }));
};

// Função auxiliar para lidar com operações do Firestore e capturar erros corretamente
const handleFirestoreOperation = async <T>(
  operation: (db: Firestore) => Promise<T>
): Promise<T> => {
  try {
    const result = await operation(db); // Executa a operação
    return result;
  } catch (error) {
    console.error('Firestore operation error:', error); // Loga erros no console
    throw error; // Propaga o erro para ser tratado na chamada
  }
};

// Objeto que encapsula as operações de CRUD no Firestore
export const dataOperations = {
  // Função para buscar todos os documentos da coleção 'timeSlots'
  async fetch(): Promise<TimeSlot[]> {
    return handleFirestoreOperation(async (db) => {
      const timeSlotCollection = collection(db, 'timeSlots'); // Obtém referência à coleção
      const querySnapshot = await getDocs(timeSlotCollection); // Obtém os documentos
      return getDocsFromSnapshot(querySnapshot); // Converte os documentos para TimeSlot[]
    }).catch(error => {
      console.error('Error fetching data:', error);
      return []; // Retorna um array vazio em caso de erro
    });
  },

  // Função para inserir um novo TimeSlot na coleção
  async insert(newSlot: any) {
    return handleFirestoreOperation(async (db) => {
      const timeSlotCollection = collection(db, 'timeSlots');
      const clonedSlot = safeClone(newSlot); // Clona os dados para evitar problemas de serialização
      await addDoc(timeSlotCollection, clonedSlot); // Adiciona o documento
      return { success: true };
    }).catch(error => {
      console.error('Error inserting data:', error);
      return { success: false }; // Retorna erro se falhar
    });
  },

  // Função para atualizar um TimeSlot com base em condições específicas
  async update(updatedSlot: any, conditions: any) {
    return handleFirestoreOperation(async (db) => {
      const timeSlotCollection = collection(db, 'timeSlots');
      const q = query(
        timeSlotCollection,
        where('date', '==', conditions.date),
        where('start_time', '==', conditions.start_time),
        where('end_time', '==', conditions.end_time)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = doc(db, 'timeSlots', querySnapshot.docs[0].id);
        const clonedSlot = safeClone(updatedSlot);
        await updateDoc(docRef, clonedSlot); // Atualiza o documento encontrado
        return { success: true };
      }
      return { success: false };
    }).catch(error => {
      console.error('Error updating data:', error);
      return { success: false };
    });
  },

  // Função para deletar um TimeSlot com base em condições específicas
  async delete(conditions: any) {
    return handleFirestoreOperation(async (db) => {
      const timeSlotCollection = collection(db, 'timeSlots');
      const q = query(
        timeSlotCollection,
        where('date', '==', conditions.date),
        where('start_time', '==', conditions.start_time),
        where('end_time', '==', conditions.end_time)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = doc(db, 'timeSlots', querySnapshot.docs[0].id);
        await deleteDoc(docRef); // Deleta o documento encontrado
        return { success: true };
      }
      return { success: false };
    }).catch(error => {
      console.error('Error deleting data:', error);
      return { success: false };
    });
  },

  // Função para deletar todos os documentos da coleção 'timeSlots'
  async clear() {
    return handleFirestoreOperation(async (db) => {
      const timeSlotCollection = collection(db, 'timeSlots');
      const querySnapshot = await getDocs(timeSlotCollection);
      
      await Promise.all(
        querySnapshot.docs.map(doc => deleteDoc(doc.ref)) // Deleta cada documento
      );
      return { success: true };
    }).catch(error => {
      console.error('Error clearing data:', error);
      return { success: false };
    });
  }
};
