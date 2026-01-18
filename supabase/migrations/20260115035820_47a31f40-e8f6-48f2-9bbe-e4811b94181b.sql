-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- RLS policies for user_roles table
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Insert admin roles for samandar@alsamos.com and alsamos@alsamos.com
INSERT INTO public.user_roles (user_id, role) VALUES
('43ccef80-21b3-43c3-bfc7-16f16bed26b6', 'admin'),
('0203984b-545e-4b17-908b-d83bb2e86e06', 'admin');

-- Update oauth_clients SELECT policy to allow admins to see all clients
DROP POLICY IF EXISTS "Users can view their own OAuth clients" ON public.oauth_clients;
CREATE POLICY "Users can view OAuth clients"
ON public.oauth_clients
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id OR public.is_admin(auth.uid()));

-- Update oauth_clients UPDATE policy to allow admins to update all clients
DROP POLICY IF EXISTS "Users can update their own OAuth clients" ON public.oauth_clients;
CREATE POLICY "Users can update OAuth clients"
ON public.oauth_clients
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id OR public.is_admin(auth.uid()));

-- Update oauth_clients DELETE policy to allow admins to delete all clients
DROP POLICY IF EXISTS "Users can delete their own OAuth clients" ON public.oauth_clients;
CREATE POLICY "Users can delete OAuth clients"
ON public.oauth_clients
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id OR public.is_admin(auth.uid()));