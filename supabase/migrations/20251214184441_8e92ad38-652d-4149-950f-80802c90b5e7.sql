-- Add district and physical_location columns to agents table
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS physical_location TEXT;

-- Create index for region lookup
CREATE INDEX IF NOT EXISTS idx_agents_region ON public.agents(region_id);