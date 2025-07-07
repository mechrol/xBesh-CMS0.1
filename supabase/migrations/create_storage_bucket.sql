/*
  # Create storage bucket for media files

  1. New Storage Bucket
    - `media` bucket for storing uploaded media files
  
  2. Security
    - Enable public access for media files
    - Add policies for authenticated users to manage their own media files
*/

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for media bucket
CREATE POLICY "Allow public access to media"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Allow authenticated users to upload media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "Allow authenticated users to update their own media"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media' AND auth.uid() = owner);

CREATE POLICY "Allow authenticated users to delete their own media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND auth.uid() = owner);
