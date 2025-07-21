
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
      <SelectTrigger className="w-full bg-background text-foreground border-border">
        <SelectValue placeholder="Selecione uma profissão" />
      </SelectTrigger>
      <SelectContent 
        className="max-h-[300px] overflow-y-auto z-[100] bg-popover text-popover-foreground border border-border shadow-lg"
        sideOffset={5}
      >
        {professions.map((profession, index) => (
          <SelectItem 
            key={`profession-${index}`} 
            value={profession}
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          >
            {profession}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
