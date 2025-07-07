/*
  # Create plugins table and related structures

  1. New Tables
    - `plugins`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text)
      - `version` (text)
      - `author` (text)
      - `author_url` (text)
      - `homepage_url` (text)
      - `main_file` (text)
      - `icon` (text)
      - `status` (text) - 'active', 'inactive', 'error'
      - `settings` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `plugin_hooks`
      - `id` (uuid, primary key)
      - `plugin_id` (uuid, references plugins)
      - `hook_name` (text)
      - `priority` (int4)
      - `callback_name` (text)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage plugins
*/

-- Create plugins table
CREATE TABLE IF NOT EXISTS plugins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  version text NOT NULL,
  author text,
  author_url text,
  homepage_url text,
  main_file text NOT NULL,
  icon text,
  status text NOT NULL DEFAULT 'inactive',
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create plugin_hooks table to track registered hooks
CREATE TABLE IF NOT EXISTS plugin_hooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id uuid REFERENCES plugins(id) ON DELETE CASCADE,
  hook_name text NOT NULL,
  priority int4 DEFAULT 10,
  callback_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_hooks ENABLE ROW LEVEL SECURITY;

-- Create policies for plugins
CREATE POLICY "Allow authenticated users to select plugins"
  ON plugins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert plugins"
  ON plugins
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update plugins"
  ON plugins
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete plugins"
  ON plugins
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for plugin_hooks
CREATE POLICY "Allow authenticated users to select plugin_hooks"
  ON plugin_hooks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert plugin_hooks"
  ON plugin_hooks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update plugin_hooks"
  ON plugin_hooks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete plugin_hooks"
  ON plugin_hooks
  FOR DELETE
  TO authenticated
  USING (true);
