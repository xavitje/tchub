# Turso Database Schema Sync Instructions

Your production database (Turso) is missing tables because it hasn't been synced with your Prisma schema.

## Option 1: Install Turso CLI and Apply Migration (Recommended)

### Step 1: Install Turso CLI
```powershell
powershell -c "irm https://get.tur.so/install.ps1 | iex"
```

### Step 2: Authenticate with Turso
```bash
turso auth login
```

### Step 3: Apply the migration
```bash
turso db shell hubtc-vercel-icfg-yurd3kxbfajj0pnxxacicsod < migration.sql
```

## Option 2: Use Turso Web Console

1. Go to https://turso.tech/app
2. Sign in
3. Select your database `hubtc-vercel-icfg-yurd3kxbfajj0pnxxacicsod`
4. Click "SQL Console"
5. Copy and paste the contents of `migration.sql` (in your project root)
6. Click "Execute"

## What This Fixes

After running the migration, these issues will be resolved:
- ✅ Support ticket viewing (fixes `isInternal` boolean conversion error)
- ✅ Certificate table creation
- ✅ Quiz table creation  
- ✅ All training-related features
- ✅ Module creation

## Verify It Worked

After running the migration, test:
1. Create and view a support ticket
2. Create a training module
3. View certificates

All 500 errors should be gone!
