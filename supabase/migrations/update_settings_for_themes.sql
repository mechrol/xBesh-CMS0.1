/*
  # Update settings table for theme functionality

  1. Changes
    - Add `active_theme` column to the `settings` table to store the currently active theme
    - Add `custom_css` column to store custom CSS for the site
  2. Notes
    - This allows for theme selection and custom CSS in the CMS
*/

-- Add active_theme column to settings table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'active_theme'
  ) THEN
    ALTER TABLE settings ADD COLUMN active_theme text DEFAULT 'default';
  END IF;
END $$;

-- Add custom_css column to settings table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'custom_css'
  ) THEN
    ALTER TABLE settings ADD COLUMN custom_css text DEFAULT '';
  END IF;
END $$;
