-- =============================================================================
-- CropPilotAI: Initial Database Migration Schema
-- Description: Core tables, RLS policies, triggers, and indexes for CropPilotAI.
-- Safe to copy and execute directly in the Supabase Cloud SQL Editor.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. PROFILES TABLE
-- Profile records linked to Supabase auth.users(id).
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 2. FARMS TABLE
-- Top-level farm entity owned by an authenticated user.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    area NUMERIC(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 3. FIELDS TABLE
-- Specific plot or field belonging to a farm and owned by the user.
-- Includes soil_type per application requirements.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    soil_type TEXT,
    area NUMERIC(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 4. CROPS TABLE
-- Crops cultivated in a specific field.
-- Tracks name, growth stage, planting date, and health status.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    growth_stage TEXT NOT NULL DEFAULT 'Seedling',
    planting_date DATE,
    status TEXT NOT NULL DEFAULT 'Healthy',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- 5. ADVISORIES TABLE
-- AI-generated agricultural diagnostic advisories linked to crops and users.
-- Stores full diagnosis, actionable recommendations, weather context, and raw JSON.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symptoms TEXT NOT NULL,
    weather_context TEXT,
    condition_name TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    severity TEXT NOT NULL,
    causes JSONB NOT NULL DEFAULT '[]'::jsonb,
    immediate_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    long_term_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    prevention JSONB NOT NULL DEFAULT '[]'::jsonb,
    expert_consult_recommended BOOLEAN NOT NULL DEFAULT false,
    disclaimer TEXT,
    raw_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);
CREATE INDEX IF NOT EXISTS idx_fields_farm_id ON public.fields(farm_id);
CREATE INDEX IF NOT EXISTS idx_fields_user_id ON public.fields(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_field_id ON public.crops(field_id);
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON public.crops(user_id);
CREATE INDEX IF NOT EXISTS idx_advisories_crop_id ON public.advisories(crop_id);
CREATE INDEX IF NOT EXISTS idx_advisories_user_id ON public.advisories(user_id);
CREATE INDEX IF NOT EXISTS idx_advisories_created_at ON public.advisories(created_at DESC);

-- =============================================================================
-- AUTOMATIC TIMESTAMP UPDATE TRIGGER FUNCTION
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_updated_at_profiles ON public.profiles;
CREATE TRIGGER trigger_set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_updated_at_farms ON public.farms;
CREATE TRIGGER trigger_set_updated_at_farms
    BEFORE UPDATE ON public.farms
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_updated_at_fields ON public.fields;
CREATE TRIGGER trigger_set_updated_at_fields
    BEFORE UPDATE ON public.fields
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_updated_at_crops ON public.crops;
CREATE TRIGGER trigger_set_updated_at_crops
    BEFORE UPDATE ON public.crops
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_updated_at_advisories ON public.advisories;
CREATE TRIGGER trigger_set_updated_at_advisories
    BEFORE UPDATE ON public.advisories
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH.USERS
-- Guarantees a public.profiles row exists whenever a new user signs up in auth.users.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = CASE 
            WHEN EXCLUDED.full_name IS NOT NULL AND EXCLUDED.full_name <> '' 
            THEN EXCLUDED.full_name 
            ELSE public.profiles.full_name 
        END,
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict isolation ensuring users can ONLY access their own records.
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisories ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- PROFILES POLICIES (Keyed on id = auth.uid())
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy" ON public.profiles
    FOR DELETE TO authenticated
    USING (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- FARMS POLICIES (Keyed on user_id = auth.uid())
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "farms_select_policy" ON public.farms;
CREATE POLICY "farms_select_policy" ON public.farms
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "farms_insert_policy" ON public.farms;
CREATE POLICY "farms_insert_policy" ON public.farms
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "farms_update_policy" ON public.farms;
CREATE POLICY "farms_update_policy" ON public.farms
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "farms_delete_policy" ON public.farms;
CREATE POLICY "farms_delete_policy" ON public.farms
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- FIELDS POLICIES (Keyed on user_id = auth.uid())
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "fields_select_policy" ON public.fields;
CREATE POLICY "fields_select_policy" ON public.fields
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "fields_insert_policy" ON public.fields;
CREATE POLICY "fields_insert_policy" ON public.fields
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "fields_update_policy" ON public.fields;
CREATE POLICY "fields_update_policy" ON public.fields
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "fields_delete_policy" ON public.fields;
CREATE POLICY "fields_delete_policy" ON public.fields
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- CROPS POLICIES (Keyed on user_id = auth.uid())
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "crops_select_policy" ON public.crops;
CREATE POLICY "crops_select_policy" ON public.crops
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "crops_insert_policy" ON public.crops;
CREATE POLICY "crops_insert_policy" ON public.crops
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "crops_update_policy" ON public.crops;
CREATE POLICY "crops_update_policy" ON public.crops
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "crops_delete_policy" ON public.crops;
CREATE POLICY "crops_delete_policy" ON public.crops
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- ADVISORIES POLICIES (Keyed on user_id = auth.uid())
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "advisories_select_policy" ON public.advisories;
CREATE POLICY "advisories_select_policy" ON public.advisories
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "advisories_insert_policy" ON public.advisories;
CREATE POLICY "advisories_insert_policy" ON public.advisories
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "advisories_update_policy" ON public.advisories;
CREATE POLICY "advisories_update_policy" ON public.advisories
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "advisories_delete_policy" ON public.advisories;
CREATE POLICY "advisories_delete_policy" ON public.advisories
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
