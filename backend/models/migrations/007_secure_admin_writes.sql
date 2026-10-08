-- Migration 007: Lock down privileged writes
--
-- Two problems this closes:
--
-- 1. users.role defaulted to 'admin', so any row created without an explicit
--    role became an administrator. Nothing in the codebase read the column, so
--    this was harmless until the role gate landed -- and would have become a
--    live privilege-escalation hole the moment self-registration was wired up.
--
-- 2. metric_limits recorded WHEN a threshold changed but never WHO changed it.
--    These are PLTP alarm thresholds; "who moved this and when" is the first
--    question anyone asks after an alarm behaves unexpectedly.

-- Safe default for any future INSERT that omits the column. Existing rows are
-- intentionally left as they are: the accounts in there today are the real
-- operators, and silently demoting them would lock everyone out.
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'viewer';

-- Constrain the vocabulary so a typo ('Admin', 'adminn') can't silently create
-- an account that passes no role check and quietly has no access.
--
-- NOT VALID on purpose. A plain CHECK is verified against every existing row,
-- so one legacy account with an unexpected role would abort this migration on
-- a production database -- exactly when you least want a failed deploy. NOT
-- VALID enforces the rule on every INSERT and UPDATE from here on while
-- leaving history alone. Nothing is lost security-wise either: requireRole
-- fails closed, so an account with an unrecognised role is denied rather than
-- allowed. The runner prints the role breakdown so you can see what is there.
--
-- Once the existing rows are known-clean, promote it with:
--   ALTER TABLE users VALIDATE CONSTRAINT users_role_allowed;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_role_allowed'
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT users_role_allowed
            CHECK (role IN ('admin', 'operator', 'viewer')) NOT VALID;
    END IF;
END
$$;

-- ON DELETE SET NULL rather than CASCADE: removing a user must never delete
-- the alarm thresholds they happened to touch last.
ALTER TABLE metric_limits
    ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
