-- Drop amount column if exists
ALTER TABLE benefits DROP COLUMN IF EXISTS amount;

-- Add new columns
ALTER TABLE benefits
ADD COLUMN multiplier DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN is_fixed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN fixed_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN created_by INT NOT NULL DEFAULT 1;

-- Add unique index
ALTER TABLE benefits
ADD UNIQUE INDEX idx_code_active (code, is_active);
