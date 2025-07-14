import { supabase } from '@/lib/supabase';
import { Agent } from '@/types/agents';
import { Group } from '@/types/groups';
import { ChatMessage } from '@/types/agents';
import { UserProfile } from '@/types/user';

export class SupabaseService {
  // Métodos para Agentes
  static async getAgents(userId: string): Promise<Agent[]> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar agentes:', error);
      throw error;
    }

    return data.map(this.mapAgentFromDB);
  }

  static async saveAgent(agent: Agent, userId: string): Promise<Agent> {
    const agentData = this.mapAgentToDB(agent, userId);
    
    const { data, error } = await supabase
      .from('agents')
      .upsert(agentData, { onConflict: 'user_id,agent_id' })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar agente:', error);
      throw error;
    }

    return this.mapAgentFromDB(data);
  }

  static async deleteAgent(agentId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('user_id', userId)
      .eq('agent_id', agentId);

    if (error) {
      console.error('Erro ao deletar agente:', error);
      throw error;
    }
  }

  // Métodos para Grupos
  static async getGroups(userId: string): Promise<Group[]> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar grupos:', error);
      throw error;
    }

    return data.map(this.mapGroupFromDB);
  }

  static async saveGroup(group: Group, userId: string): Promise<Group> {
    const groupData = this.mapGroupToDB(group, userId);
    
    const { data, error } = await supabase
      .from('groups')
      .upsert(groupData, { onConflict: 'user_id,group_id' })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar grupo:', error);
      throw error;
    }

    return this.mapGroupFromDB(data);
  }

  static async deleteGroup(groupId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('user_id', userId)
      .eq('group_id', groupId);

    if (error) {
      console.error('Erro ao deletar grupo:', error);
      throw error;
    }
  }

  // Métodos para Mensagens de Chat
  static async getChatMessages(userId: string, agentId?: string, groupId?: string): Promise<ChatMessage[]> {
    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
      throw error;
    }

    return data.map(this.mapMessageFromDB);
  }

  static async saveMessage(message: ChatMessage, userId: string): Promise<ChatMessage> {
    const messageData = this.mapMessageToDB(message, userId);
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar mensagem:', error);
      throw error;
    }

    return this.mapMessageFromDB(data);
  }

  // Métodos para Perfil do Usuário
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Perfil não encontrado
      }
      console.error('Erro ao buscar perfil:', error);
      throw error;
    }

    return this.mapProfileFromDB(data);
  }

  static async saveUserProfile(profile: UserProfile, userId: string): Promise<UserProfile> {
    const profileData = this.mapProfileToDB(profile, userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar perfil:', error);
      throw error;
    }

    return this.mapProfileFromDB(data);
  }

  // Métodos de mapeamento entre tipos da aplicação e banco de dados
  private static mapAgentFromDB(dbAgent: any): Agent {
    return {
      id: dbAgent.agent_id,
      name: dbAgent.name,
      title: dbAgent.title,
      specialty: dbAgent.specialty,
      description: dbAgent.description,
      icon: dbAgent.icon,
      color: dbAgent.color,
      experience: dbAgent.experience,
      approach: dbAgent.approach,
      guidelines: dbAgent.guidelines,
      personaStyle: dbAgent.persona_style,
      documentation: dbAgent.documentation,
      isActive: dbAgent.is_active,
      avatar: dbAgent.avatar
    };
  }

  private static mapAgentToDB(agent: Agent, userId: string): any {
    return {
      user_id: userId,
      agent_id: agent.id,
      name: agent.name,
      title: agent.title,
      specialty: agent.specialty,
      description: agent.description,
      icon: agent.icon,
      color: agent.color,
      experience: agent.experience,
      approach: agent.approach,
      guidelines: agent.guidelines,
      persona_style: agent.personaStyle,
      documentation: agent.documentation,
      is_active: agent.isActive,
      avatar: agent.avatar
    };
  }

  private static mapGroupFromDB(dbGroup: any): Group {
    return {
      id: dbGroup.group_id,
      name: dbGroup.name,
      description: dbGroup.description,
      icon: dbGroup.icon,
      color: dbGroup.color,
      members: dbGroup.members || [],
      isDefault: dbGroup.is_default,
      createdBy: dbGroup.created_by as 'user' | 'system',
      createdAt: new Date(dbGroup.created_at)
    };
  }

  private static mapGroupToDB(group: Group, userId: string): any {
    return {
      user_id: userId,
      group_id: group.id,
      name: group.name,
      description: group.description,
      icon: group.icon,
      color: group.color,
      members: group.members,
      is_default: group.isDefault,
      created_by: group.createdBy
    };
  }

  private static mapMessageFromDB(dbMessage: any): ChatMessage {
    return {
      id: dbMessage.message_id,
      content: dbMessage.content,
      sender: dbMessage.sender as 'user' | 'agent',
      timestamp: new Date(dbMessage.created_at),
      agentId: dbMessage.agent_id,
      audioUrl: dbMessage.audio_url
    };
  }

  private static mapMessageToDB(message: ChatMessage, userId: string): any {
    return {
      user_id: userId,
      agent_id: message.agentId,
      group_id: null, // Para mensagens de grupo, seria necessário adicionar groupId ao tipo ChatMessage
      message_id: message.id,
      content: message.content,
      sender: message.sender,
      sender_name: null,
      sender_avatar: null,
      mentions: null,
      audio_url: message.audioUrl
    };
  }

  private static mapProfileFromDB(dbProfile: any): UserProfile {
    return {
      id: dbProfile.user_id,
      name: dbProfile.name,
      email: dbProfile.email,
      avatar: dbProfile.avatar,
      bio: dbProfile.bio,
      preferences: dbProfile.preferences,
      createdAt: new Date(dbProfile.created_at),
      updatedAt: new Date(dbProfile.updated_at)
    };
  }

  private static mapProfileToDB(profile: UserProfile, userId: string): any {
    return {
      user_id: userId,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
      bio: profile.bio,
      preferences: profile.preferences
    };
  }
}