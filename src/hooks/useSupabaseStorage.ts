import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useSupabaseStorage<T>(
  table: string,
  defaultValue: T,
  options?: {
    orderBy?: { column: string; ascending?: boolean };
    filter?: { column: string; value: any };
  }
): [T, (value: T | ((prev: T) => T)) => Promise<void>, boolean, string | null] {
  const { user } = useAuth();
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do Supabase
  useEffect(() => {
    if (!user) {
      setData(defaultValue);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from(table)
          .select('*')
          .eq('user_id', user.id);

        if (options?.filter) {
          query = query.eq(options.filter.column, options.filter.value);
        }

        if (options?.orderBy) {
          query = query.order(options.orderBy.column, { 
            ascending: options.orderBy.ascending ?? true 
          });
        }

        const { data: result, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        setData(result as T);
      } catch (err) {
        console.error(`Erro ao carregar dados da tabela ${table}:`, err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setData(defaultValue);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, table, defaultValue]);

  // Função para salvar dados
  const saveData = async (value: T | ((prev: T) => T)) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setError(null);
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(data) : value;
      
      // Para arrays, precisamos fazer upsert de cada item
      if (Array.isArray(newValue)) {
        const items = newValue as any[];
        
        for (const item of items) {
          const itemWithUserId = { ...item, user_id: user.id };
          
          const { error: upsertError } = await supabase
            .from(table)
            .upsert(itemWithUserId, { 
              onConflict: getUniqueColumns(table),
              ignoreDuplicates: false 
            });

          if (upsertError) {
            throw upsertError;
          }
        }
      } else {
        // Para objetos únicos
        const itemWithUserId = { ...newValue, user_id: user.id };
        
        const { error: upsertError } = await supabase
          .from(table)
          .upsert(itemWithUserId, { 
            onConflict: getUniqueColumns(table),
            ignoreDuplicates: false 
          });

        if (upsertError) {
          throw upsertError;
        }
      }

      setData(newValue);
    } catch (err) {
      console.error(`Erro ao salvar dados na tabela ${table}:`, err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
      throw err;
    }
  };

  return [data, saveData, loading, error];
}

// Helper para determinar colunas únicas por tabela
function getUniqueColumns(table: string): string {
  const uniqueColumns: Record<string, string> = {
    'profiles': 'user_id',
    'agents': 'user_id,agent_id',
    'groups': 'user_id,group_id',
    'chat_messages': 'id',
    'agent_interactions': 'user_id,agent_id'
  };

  return uniqueColumns[table] || 'id';
}