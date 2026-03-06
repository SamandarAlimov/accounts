
-- Create saved_passwords table for password manager
CREATE TABLE public.saved_passwords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  website TEXT NOT NULL,
  website_url TEXT,
  username TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  notes TEXT,
  category TEXT DEFAULT 'general',
  favicon_url TEXT,
  strength TEXT DEFAULT 'medium' CHECK (strength IN ('weak', 'medium', 'strong')),
  is_breached BOOLEAN DEFAULT false,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_passwords ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only access their own passwords
CREATE POLICY "Users can view their own passwords"
  ON public.saved_passwords FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own passwords"
  ON public.saved_passwords FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own passwords"
  ON public.saved_passwords FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own passwords"
  ON public.saved_passwords FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_saved_passwords_updated_at
  BEFORE UPDATE ON public.saved_passwords
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_passwords;
