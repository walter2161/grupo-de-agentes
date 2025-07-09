
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const specialties = [
  'Marketing Digital',
  'Gestão de Tráfego Pago',
  'Gestão de Redes Sociais',
  'Design Gráfico e Visual',
  'Planejamento Financeiro',
  'Contabilidade e Tributação',
  'Consultoria Jurídica',
  'Psicologia Clínica',
  'Humor e Entretenimento',
  'Língua Portuguesa',
  'Matemática',
  'Programação e Desenvolvimento',
  'Arquitetura e Design',
  'Engenharia',
  'Medicina',
  'Enfermagem',
  'Nutrição',
  'Educação Física',
  'Administração',
  'Recursos Humanos',
  'Vendas e Negociação',
  'Consultoria Empresarial',
  'Fotografia',
  'Jornalismo',
  'Tradução e Interpretação',
  'Culinária',
  'Música',
  'Turismo',
  'Veterinária',
  'Farmácia'
];

interface SpecialtySelectorProps {
  selectedSpecialty: string;
  onSpecialtySelect: (specialty: string) => void;
}

export const SpecialtySelector: React.FC<SpecialtySelectorProps> = ({ 
  selectedSpecialty, 
  onSpecialtySelect 
}) => {
  return (
    <Select value={selectedSpecialty} onValueChange={onSpecialtySelect}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione uma especialidade" />
      </SelectTrigger>
      <SelectContent>
        {specialties.map((specialty) => (
          <SelectItem key={specialty} value={specialty}>
            {specialty}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
