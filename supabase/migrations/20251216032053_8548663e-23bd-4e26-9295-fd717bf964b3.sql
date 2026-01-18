-- OAuth Clients table for registered applications
CREATE TABLE public.oauth_clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id text UNIQUE NOT NULL DEFAULT ('client_' || gen_random_uuid()::text),
    client_secret text NOT NULL DEFAULT ('secret_' || encode(gen_random_bytes(32), 'hex')),
    name text NOT NULL,
    description text,
    logo_url text,
    redirect_uris text[] NOT NULL DEFAULT '{}',
    allowed_scopes text[] NOT NULL DEFAULT ARRAY['openid', 'profile', 'email'],
    is_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    owner_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- OAuth Authorization Codes (short-lived)
CREATE TABLE public.oauth_authorization_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    client_id text NOT NULL REFERENCES public.oauth_clients(client_id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    code_challenge text,
    code_challenge_method text,
    expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '10 minutes'),
    used boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- OAuth Access Tokens
CREATE TABLE public.oauth_access_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(64), 'hex'),
    client_id text NOT NULL REFERENCES public.oauth_clients(client_id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    scope text NOT NULL,
    expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '1 hour'),
    revoked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- OAuth Refresh Tokens
CREATE TABLE public.oauth_refresh_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(64), 'hex'),
    access_token_id uuid REFERENCES public.oauth_access_tokens(id) ON DELETE CASCADE,
    client_id text NOT NULL REFERENCES public.oauth_clients(client_id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    scope text NOT NULL,
    expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days'),
    revoked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.oauth_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_authorization_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_refresh_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for oauth_clients
CREATE POLICY "Users can view their own OAuth clients"
ON public.oauth_clients FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create OAuth clients"
ON public.oauth_clients FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own OAuth clients"
ON public.oauth_clients FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own OAuth clients"
ON public.oauth_clients FOR DELETE
USING (auth.uid() = owner_id);

-- RLS Policies for oauth_authorization_codes
CREATE POLICY "Users can view their own auth codes"
ON public.oauth_authorization_codes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create auth codes"
ON public.oauth_authorization_codes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for oauth_access_tokens
CREATE POLICY "Users can view their own access tokens"
ON public.oauth_access_tokens FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can revoke their own access tokens"
ON public.oauth_access_tokens FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for oauth_refresh_tokens
CREATE POLICY "Users can view their own refresh tokens"
ON public.oauth_refresh_tokens FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can revoke their own refresh tokens"
ON public.oauth_refresh_tokens FOR UPDATE
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_oauth_clients_updated_at
BEFORE UPDATE ON public.oauth_clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();