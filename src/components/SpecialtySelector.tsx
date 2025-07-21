
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const professions = [
  'Médico',
  'Enfermeiro',
  'Professor',
  'Engenheiro',
  'Advogado',
  'Contador',
  'Psicólogo',
  'Dentista',
  'Farmacêutico',
  'Veterinário',
  'Arquiteto',
  'Designer',
  'Programador',
  'Jornalista',
  'Fotógrafo',
  'Chef de Cozinha',
  'Nutricionista',
  'Fisioterapeuta',
  'Personal Trainer',
  'Vendedor',
  'Administrador',
  'Consultor',
  'Músico',
  'Artista',
  'Mecânico',
  'Eletricista',
  'Encanador',
  'Carpinteiro',
  'Corretor de Imóveis',
  'Motorista'
];

interface ProfessionSelectorProps {
  selectedProfession: string;
  onProfessionSelect: (profession: string) => void;
}

export const SpecialtySelector: React.FC<ProfessionSelectorProps> = ({ 
  selectedProfession, 
  onProfessionSelect 
}) => {
  return (
    <Select 
      value={selectedProfession} 
      onValueChange={(value) => {
        console.log('Profession selected:', value);
        onProfessionSelect(value);
      }}
    >
      <SelectTrigger className="w-full bg-background">
        <SelectValue placeholder="Selecione uma profissão" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] overflow-y-auto z-50 bg-background border border-border">
        {professions.map((profession, index) => (
          <SelectItem 
            key={`profession-${index}`} 
            value={profession}
            className="cursor-pointer hover:bg-accent"
          >
            {profession}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
