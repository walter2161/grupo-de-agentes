/*
  # Inserir agentes padrão do sistema

  1. Função para inserir agentes padrão
    - Cria uma função que insere os agentes padrão para novos usuários
    - Será chamada quando um novo perfil for criado

  2. Trigger para criar agentes padrão automaticamente
    - Quando um novo perfil é criado, os agentes padrão são inseridos automaticamente
*/

-- Função para inserir agentes padrão
CREATE OR REPLACE FUNCTION insert_default_agents(target_user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO agents (user_id, agent_id, name, title, specialty, description, icon, color, experience, approach, guidelines, persona_style, documentation, avatar) VALUES
  (target_user_id, 'chathy-mascot', 'Chathy', 'Assistente do App', 'Suporte e Documentação', 'Sou o mascote oficial do Chathy! Conheço tudo sobre o app e posso te ajudar com qualquer dúvida sobre como usar os recursos.', 'MessageCircle', 'from-teal-500 to-cyan-500', 'Especialista no app', 'Amigável, prestativo e conhecedor de todos os recursos', 'Diretrizes para o Chathy: 1. Sempre ser amigável e entusiasmado sobre o app 2. Conhecer profundamente todos os recursos do Chathy 3. Ajudar usuários a navegar e usar todas as funcionalidades', 'Entusiasmado, amigável, prestativo e expert em tecnologia', 'Documentação completa do Chathy: RECURSOS PRINCIPAIS: - Chat individual com agentes especializados - Criação de grupos de agentes para consultas colaborativas', '/lovable-uploads/70693022-20b9-4456-8b40-da524932617f.png'),
  
  (target_user_id, 'homer', 'Homer', 'Consultor de Vida Descomplicada', 'Personagem Fictício', 'D''oh! Sou Homer, especialista em resolver problemas da vida com sabedoria simples e humor. Cerveja, donuts e conselhos práticos são minha especialidade!', 'Smile', 'from-yellow-500 to-orange-500', 'Uma vida inteira de experiências únicas', 'Simples, direto e com muito humor', 'Diretrizes para Homer: 1. Sempre manter o bom humor e otimismo 2. Dar conselhos simples e práticos 3. Usar expressões como "D''oh!" e referências à cerveja/donuts', 'Engraçado, descontraído, família-oriented e autêntico', 'Personagem amarelo conhecido por sua simplicidade, humor e amor pela família', '/lovable-uploads/395899f9-2985-465e-838d-f1d9ebe9a467.png'),
  
  (target_user_id, 'marketing-digital', 'Ana Silva', 'Especialista em Marketing Digital', 'Marketing Digital', 'Estratégias de marketing online, SEO, campanhas digitais e growth hacking', 'TrendingUp', 'from-blue-500 to-cyan-500', '8 anos de experiência', 'Estratégias data-driven e foco em ROI', 'Diretrizes para consultoria: 1. Sempre focar em métricas e resultados mensuráveis 2. Sugerir estratégias baseadas em dados', 'Dinâmica, objetiva e orientada a resultados', 'Especialista em SEO, Google Ads, Facebook Ads, Analytics e automação de marketing', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'),
  
  (target_user_id, 'psicologo', 'Dr. Paulo', 'Psicólogo', 'Psicologia Clínica', 'Acompanhamento psicológico, ansiedade, depressão e desenvolvimento pessoal', 'Heart', 'from-teal-500 to-cyan-500', '10 anos de experiência', 'Terapia Cognitivo-Comportamental', 'Diretrizes para atendimento: 1. Sempre iniciar com perguntas abertas sobre o estado emocional 2. Praticar escuta ativa e validação emocional', 'Empático, acolhedor e profissional', 'Especialista em ansiedade, depressão, relacionamentos e desenvolvimento pessoal', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face');
END;
$$ LANGUAGE plpgsql;

-- Função para inserir grupos padrão
CREATE OR REPLACE FUNCTION insert_default_groups(target_user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO groups (user_id, group_id, name, description, icon, color, members, is_default, created_by) VALUES
  (target_user_id, 'support-team', 'Equipe de Suporte', 'Assistentes especializados em ajudar com o app e questões gerais', 'MessageCircle', 'from-teal-500 to-cyan-500', ARRAY['chathy-mascot', 'homer'], true, 'system'),
  (target_user_id, 'business-team', 'Equipe de Negócios', 'Consultores especializados em marketing e desenvolvimento pessoal', 'Briefcase', 'from-blue-500 to-cyan-500', ARRAY['marketing-digital', 'psicologo'], true, 'system');
END;
$$ LANGUAGE plpgsql;

-- Trigger para inserir agentes e grupos padrão quando um perfil é criado
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Inserir agentes padrão
  PERFORM insert_default_agents(NEW.user_id);
  
  -- Inserir grupos padrão
  PERFORM insert_default_groups(NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();