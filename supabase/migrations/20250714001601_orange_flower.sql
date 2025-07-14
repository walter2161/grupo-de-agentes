/*
  # Criar tabela de grupos

  1. Nova Tabela
    - `groups`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `group_id` (text, unique per user)
      - `name` (text)
      - `description` (text)
      - `icon` (text)
      - `color` (text)
      - `members` (text array - agent IDs)
      - `is_default` (boolean, default false)
      - `created_by` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Enable RLS on `groups` table
    - Add policies for users to manage their own groups
*/

CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  group_id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'Users',
  color text NOT NULL DEFAULT 'from-blue-500 to-cyan-500',
  members text[] DEFAULT '{}',
  is_default boolean DEFAULT false,
  created_by text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, group_id)
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Policies para usuários gerenciarem apenas seus próprios grupos
CREATE POLICY "Users can read own groups"
  ON groups
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own groups"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own groups"
  ON groups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own groups"
  ON groups
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();