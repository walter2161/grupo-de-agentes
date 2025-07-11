import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Plus, Edit, Trash2, Save, User } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

interface Persona {
  id: string;
  name: string;
  description: string;
  personality: string;
  communicationStyle: string;
  expertise: string[];
  tone: string;
  createdAt: Date;
  updatedAt: Date;
}

export const PersonaManager = () => {
  const [personas, setPersonas] = useLocalStorage<Persona[]>('personas', []);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPersona, setNewPersona] = useState({
    name: '',
    description: '',
    personality: '',
    communicationStyle: '',
    expertise: '',
    tone: ''
  });
  const { toast } = useToast();

  const handleSave = () => {
    if (!newPersona.name || !newPersona.personality) {
      toast({
        title: "Erro",
        description: "Nome e personalidade são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const expertiseArray = newPersona.expertise.split(',').map(e => e.trim()).filter(e => e);

    if (editingId) {
      setPersonas(prev => prev.map(persona =>
        persona.id === editingId
          ? { 
              ...persona, 
              ...newPersona, 
              expertise: expertiseArray,
              updatedAt: new Date() 
            }
          : persona
      ));
      setEditingId(null);
    } else {
      const persona: Persona = {
        id: Date.now().toString(),
        ...newPersona,
        expertise: expertiseArray,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setPersonas(prev => [...prev, persona]);
    }

    setNewPersona({ 
      name: '', 
      description: '', 
      personality: '', 
      communicationStyle: '', 
      expertise: '', 
      tone: '' 
    });
    setIsCreating(false);
    toast({
      title: "Sucesso",
      description: "Persona salva com sucesso!",
    });
  };

  const handleEdit = (persona: Persona) => {
    setNewPersona({
      name: persona.name,
      description: persona.description,
      personality: persona.personality,
      communicationStyle: persona.communicationStyle,
      expertise: persona.expertise.join(', '),
      tone: persona.tone
    });
    setEditingId(persona.id);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    setPersonas(prev => prev.filter(persona => persona.id !== id));
    toast({
      title: "Sucesso",
      description: "Persona excluída com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <MessageSquare className="h-6 w-6" />
          <span>Personas dos Agentes</span>
        </h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Persona
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Persona' : 'Nova Persona'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Persona</Label>
                <Input
                  id="name"
                  value={newPersona.name}
                  onChange={(e) => setNewPersona(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Assistente Empático"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tom de Voz</Label>
                <Input
                  id="tone"
                  value={newPersona.tone}
                  onChange={(e) => setNewPersona(prev => ({ ...prev, tone: e.target.value }))}
                  placeholder="Ex: Amigável, Profissional, Casual"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={newPersona.description}
                onChange={(e) => setNewPersona(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Breve descrição da persona"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personality">Personalidade</Label>
              <Textarea
                id="personality"
                value={newPersona.personality}
                onChange={(e) => setNewPersona(prev => ({ ...prev, personality: e.target.value }))}
                placeholder="Descreva a personalidade da persona..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="communicationStyle">Estilo de Comunicação</Label>
              <Textarea
                id="communicationStyle"
                value={newPersona.communicationStyle}
                onChange={(e) => setNewPersona(prev => ({ ...prev, communicationStyle: e.target.value }))}
                placeholder="Como a persona se comunica..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expertise">Áreas de Expertise</Label>
              <Input
                id="expertise"
                value={newPersona.expertise}
                onChange={(e) => setNewPersona(prev => ({ ...prev, expertise: e.target.value }))}
                placeholder="Ex: Psicologia, Terapia, Aconselhamento (separadas por vírgula)"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  setNewPersona({ 
                    name: '', 
                    description: '', 
                    personality: '', 
                    communicationStyle: '', 
                    expertise: '', 
                    tone: '' 
                  });
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {personas.map((persona) => (
          <Card key={persona.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>{persona.name}</span>
                  </CardTitle>
                  {persona.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {persona.description}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(persona)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(persona.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm">Personalidade:</h4>
                <p className="text-sm text-muted-foreground">{persona.personality}</p>
              </div>
              
              {persona.communicationStyle && (
                <div>
                  <h4 className="font-medium text-sm">Estilo de Comunicação:</h4>
                  <p className="text-sm text-muted-foreground">{persona.communicationStyle}</p>
                </div>
              )}

              {persona.tone && (
                <div>
                  <h4 className="font-medium text-sm">Tom de Voz:</h4>
                  <p className="text-sm text-muted-foreground">{persona.tone}</p>
                </div>
              )}

              {persona.expertise.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm">Áreas de Expertise:</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {persona.expertise.map((exp, index) => (
                      <span 
                        key={index}
                        className="bg-muted px-2 py-1 rounded-md text-xs"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Criado em: {persona.createdAt.toLocaleDateString('pt-BR')} | 
                Atualizado em: {persona.updatedAt.toLocaleDateString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        ))}

        {personas.length === 0 && !isCreating && (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhuma persona cadastrada ainda.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};