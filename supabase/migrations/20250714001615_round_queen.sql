/*
  # Criar tabela de interações dos agentes

  1. Nova Tabela
    - `agent_interactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `agent_id` (text)
      - `self_messages_today` (integer, default 0)
      - `random_questions_sent` (integer, default 0)
      - `last_interaction` (timestamp)
      - `last_random_question` (timestamp)
      - `last_self_message` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Enable RLS on `agent_interactions` table
    - Add policies for users to manage their own interactions
*/

CREATE TABLE IF NOT EXISTS agent_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id text NOT NULL,
  self_messages_today integer DEFAULT 0,
  random_questions_sent integer DEFAULT 0,
  last_interaction timestamptz DEFAULT now(),
  last_random_question timestamptz DEFAULT '1970-01-01'::timestamptz,
  last_self_message timestamptz DEFAULT '1970-01-01'::timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, agent_id)
);

ALTER TABLE agent_interactions ENABLE ROW LEVEL SECURITY;

-- Policies para usuários gerenciarem apenas suas próprias interações
CREATE POLICY "Users can read own interactions"
  ON agent_interactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions"
  ON agent_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions"
  ON agent_interactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_agent_interactions_updated_at
  BEFORE UPDATE ON agent_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();