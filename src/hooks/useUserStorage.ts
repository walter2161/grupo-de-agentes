import { useSupabaseStorage } from './useSupabaseStorage';
import { Agent } from '@/types/agents';
import { Group } from '@/types/groups';
import { UserProfile } from '@/types/user';
import { ChatMessage } from '@/types/agents';
import { AgentInteractionCount } from '@/types/userLimits';

// Hook especializado para diferentes tipos de dados
export function useUserStorage<T>(
  key: string, 
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => Promise<void>, boolean, string | null] {
  
  // Mapear chaves para tabelas do Supabase
  const getTableAndOptions = (key: string) => {
    switch (key) {
      case 'agents':
        return { 
          table: 'agents', 
          options: { orderBy: { column: 'created_at', ascending: true } } 
        };
      case 'groups':
        return { 
          table: 'groups', 
          options: { orderBy: { column: 'created_at', ascending: true } } 
        };
      case 'user-profile':
        return { 
          table: 'profiles', 
          options: undefined 
        };
      case 'agent-interactions':
        return { 
          table: 'agent_interactions', 
          options: { orderBy: { column: 'last_interaction', ascending: false } } 
        };
      default:
        // Para chaves que começam com 'chat-history-', usar tabela de mensagens
        if (key.startsWith('chat-history-')) {
          const agentId = key.replace('chat-history-', '');
          return { 
            table: 'chat_messages', 
            options: { 
              filter: { column: 'agent_id', value: agentId },
              orderBy: { column: 'created_at', ascending: true } 
            } 
          };
        }
        // Para chaves que começam com 'group-chat-', usar tabela de mensagens
        if (key.startsWith('group-chat-')) {
          const groupId = key.replace('group-chat-', '');
          return { 
            table: 'chat_messages', 
            options: { 
              filter: { column: 'group_id', value: groupId },
              orderBy: { column: 'created_at', ascending: true } 
            } 
          };
        }
        // Fallback para localStorage para chaves não mapeadas
        return null;
    }
  };

  const tableConfig = getTableAndOptions(key);
  
  if (!tableConfig) {
    // Fallback para localStorage para chaves não suportadas
    return useLocalStorageFallback(key, initialValue);
  }

  return useSupabaseStorage<T>(tableConfig.table, initialValue, tableConfig.options);
}

// Fallback para localStorage quando não há mapeamento para Supabase
function useLocalStorageFallback<T>(
  key: string, 
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => Promise<void>, boolean, string | null] {
  const [data, setData] = React.useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const saveData = async (value: T | ((prev: T) => T)) => {
    const newValue = typeof value === 'function' ? (value as (prev: T) => T)(data) : value;
    setData(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [data, saveData, false, null];
}