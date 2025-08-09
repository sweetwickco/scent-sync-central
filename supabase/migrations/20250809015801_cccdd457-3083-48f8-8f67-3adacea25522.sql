-- Add inventory tracking columns to supplies table
ALTER TABLE public.supplies ADD COLUMN current_quantity NUMERIC DEFAULT 0;
ALTER TABLE public.supplies ADD COLUMN low_threshold NUMERIC DEFAULT 0;