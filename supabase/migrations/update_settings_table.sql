/*
  # Update settings table with permalink structure

  1. Changes
    - Add `permalink_structure` column to the `settings` table to store the URL structure for posts
  2. Notes
    - This allows customizing how post URLs are structured (e.g., /blog/, /articles/, etc.)
*/

-- Add permalink_structure column to settings table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'permalink_structure'
  ) THEN
    ALTER TABLE settings ADD COLUMN permalink_structure text DEFAULT '/blog';
  END IF;
END $$;
