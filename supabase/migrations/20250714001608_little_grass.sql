/*
  # Criar tabela de mensagens de chat

  1. Nova Tabela
    - `chat_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `agent_id` (text)
      - `group_id` (text, nullable)
      - `message_id` (text)
      - `content` (text)
      - `sender` (text - 'user' or 'agent')
      - `sender_name` (text, nullable)
      - `sender_avatar` (text, nullable)
      - `mentions` (text array, nullable)
      - `audio_url` (text, nullable)
      - `created_at` (timestamp)

  2. Segurança
    - Enable RLS on `chat_messages` table
    - Add policies for users to manage their own messages
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id text,
  group_id text,
  message_id text NOT NULL,
  content text NOT NULL,
  sender text NOT NULL CHECK (sender IN ('user', 'agent')),
  sender_name text,
  sender_avatar text,
  mentions text[],
  audio_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies para usuários gerenciarem apenas suas próprias mensagens
CREATE POLICY "Users can read own messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON chat_messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_agent 
  ON chat_messages(user_id, agent_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_group 
  ON chat_messages(user_id, group_id, created_at DESC);