
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AgentCard } from './AgentCard';
import { AgentFilters } from './AgentFilters';
import { Agent } from '@/types/agents';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { defaultAgents } from '@/types/agents';

interface AgentPortalProps {
  onAgentSelect: (agent: Agent) => void;
}

export const AgentPortal: React.FC<AgentPortalProps> = ({ onAgentSelect }) => {
  const [agents, setAgents] = useLocalStorage<Agent[]>('agents', defaultAgents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  
  // Assegura que os agentes padrão sejam carregados se não houver dados salvos
  useEffect(() => {
    if (agents.length === 0) {
      setAgents(defaultAgents);
    }
  }, [agents.length, setAgents]);

  const filteredAgents = agents.filter(agent => {
    if (!agent.isActive) return false;
    
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'all' || agent.specialty === selectedSpecialty;
    
    const matchesExperience = selectedExperience === 'all' || 
      agent.experience.toLowerCase().includes(selectedExperience.toLowerCase());
    
    return matchesSearch && matchesSpecialty && matchesExperience;
  });

  const handleClearFilters = () => {
    setSelectedSpecialty('all');
    setSelectedExperience('all');
    setSearchTerm('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Portal de Agentes IA
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Escolha um especialista em IA para te ajudar com suas necessidades
        </p>
        
        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar especialista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <AgentFilters
          selectedSpecialty={selectedSpecialty}
          selectedExperience={selectedExperience}
          onSpecialtyChange={setSelectedSpecialty}
          onExperienceChange={setSelectedExperience}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Agents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onClick={() => onAgentSelect(agent)}
          />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Nenhum agente encontrado para "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
};
