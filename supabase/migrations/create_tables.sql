/*
  # Create CMS tables

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `content` (text)
      - `excerpt` (text)
      - `status` (text)
      - `featured_image` (text)
      - `author_id` (uuid, references auth.users)
      - `meta_title` (text)
      - `meta_description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `pages`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `content` (text)
      - `status` (text)
      - `featured_image` (text)
      - `template` (text)
      - `author_id` (uuid, references auth.users)
      - `meta_title` (text)
      - `meta_description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `media`
      - `id` (uuid, primary key)
      - `name` (text)
      - `file_path` (text)
      - `url` (text)
      - `size` (int8)
      - `type` (text)
      - `created_at` (timestamptz)
    - `settings`
      - `id` (uuid, primary key)
      - `site_title` (text)
      - `site_description` (text)
      - `site_logo` (text)
      - `site_favicon` (text)
      - `footer_text` (text)
      - `posts_per_page` (int4)
      - `disqus_shortname` (text)
      - `google_analytics_id` (text)
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own content
*/

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  excerpt text,
  status text NOT NULL DEFAULT 'draft',
  featured_image text,
  author_id uuid REFERENCES auth.users(id),
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  status text NOT NULL DEFAULT 'draft',
  featured_image text,
  template text DEFAULT 'default',
  author_id uuid REFERENCES auth.users(id),
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create media table
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_path text,
  url text,
  size int8,
  type text,
  created_at timestamptz DEFAULT now()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title text NOT NULL DEFAULT 'My CMS',
  site_description text,
  site_logo text,
  site_favicon text,
  footer_text text,
  posts_per_page int4 DEFAULT 10,
  disqus_shortname text,
  google_analytics_id text
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
CREATE POLICY "Allow authenticated users to select posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert their own posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Allow authenticated users to update their own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Allow authenticated users to delete their own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Create policies for pages
CREATE POLICY "Allow authenticated users to select pages"
  ON pages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert their own pages"
  ON pages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Allow authenticated users to update their own pages"
  ON pages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Allow authenticated users to delete their own pages"
  ON pages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Create policies for media
CREATE POLICY "Allow authenticated users to select media"
  ON media
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert media"
  ON media
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update media"
  ON media
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete media"
  ON media
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for settings
CREATE POLICY "Allow authenticated users to select settings"
  ON settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert settings"
  ON settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update settings"
  ON settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
