
-- Kids accounts table
CREATE TABLE public.kids_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  child_first_name TEXT NOT NULL,
  child_last_name TEXT NOT NULL,
  child_username TEXT NOT NULL UNIQUE,
  child_age INTEGER NOT NULL,
  screen_time_limit INTEGER NOT NULL DEFAULT 120,
  content_filter_level TEXT NOT NULL DEFAULT 'moderate',
  app_restrictions BOOLEAN NOT NULL DEFAULT true,
  sleep_mode_enabled BOOLEAN NOT NULL DEFAULT true,
  sleep_mode_start TEXT DEFAULT '21:00',
  sleep_mode_end TEXT DEFAULT '07:00',
  parent_approval_required BOOLEAN NOT NULL DEFAULT true,
  location_sharing BOOLEAN NOT NULL DEFAULT true,
  device_name TEXT,
  device_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.kids_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their kids accounts" ON public.kids_accounts FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parents can create kids accounts" ON public.kids_accounts FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents can update their kids accounts" ON public.kids_accounts FOR UPDATE USING (auth.uid() = parent_id);
CREATE POLICY "Parents can delete their kids accounts" ON public.kids_accounts FOR DELETE USING (auth.uid() = parent_id);

CREATE TRIGGER update_kids_accounts_updated_at BEFORE UPDATE ON public.kids_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Business accounts table
CREATE TABLE public.business_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  company_domain TEXT,
  company_address TEXT,
  tax_id TEXT,
  admin_first_name TEXT,
  admin_last_name TEXT,
  admin_email TEXT,
  admin_phone TEXT,
  domain_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.business_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their business accounts" ON public.business_accounts FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can create business accounts" ON public.business_accounts FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their business accounts" ON public.business_accounts FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete their business accounts" ON public.business_accounts FOR DELETE USING (auth.uid() = owner_id);

CREATE TRIGGER update_business_accounts_updated_at BEFORE UPDATE ON public.business_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.kids_accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.business_accounts;
