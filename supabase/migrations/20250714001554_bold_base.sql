/*
  # Criar tabela de agentes

  1. Nova Tabela
    - `agents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `agent_id` (text, unique per user)
      - `name` (text)
      - `title` (text)
      - `specialty` (text)
      - `description` (text)
      - `icon` (text)
      - `color` (text)
      - `experience` (text)
      - `approach` (text)
      - `guidelines` (text)
      - `persona_style` (text)
      - `documentation` (text)
      - `is_active` (boolean, default true)
      - `avatar` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Enable RLS on `agents` table
    - Add policies for users to manage their own agents
*/

CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id text NOT NULL,
  name text NOT NULL,
  title text NOT NULL,
  specialty text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'User',
  color text NOT NULL DEFAULT 'from-blue-500 to-cyan-500',
  experience text NOT NULL,
  approach text NOT NULL,
  guidelines text NOT NULL,
  persona_style text NOT NULL,
  documentation text NOT NULL,
  is_active boolean DEFAULT true,
  avatar text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Policies para usuários gerenciarem apenas seus próprios agentes
CREATE POLICY "Users can read own agents"
  ON agents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agents"
  ON agents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agents"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own agents"
  ON agents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();