# Why Domain A Works But Domain B Doesn't

## The Real Issue

If the **code is identical** and **env vars are copied**, but one domain works and the other doesn't, the problem is almost always:

### 1. **Functions Not Deployed** (Most Common)

**Check:**
- Netlify Dashboard → Site Settings → Functions tab
- Compare Domain A vs Domain B
- Domain A should have functions listed
- Domain B might be missing functions

**Why this happens:**
- Functions are only deployed when the build completes successfully
- If Domain B's build failed or was incomplete, functions weren't deployed
- Functions need to be in the `netlify/functions/` directory in git

**Fix:**
1. Check build logs for Domain B
2. Look for "Packaging Functions..." in the logs
3. If missing, trigger a fresh deploy
4. Verify functions appear in Functions tab after deploy

### 2. **Environment Variables Not Set for Functions**

**Critical:** Netlify has TWO places for environment variables:

1. **Site Environment Variables** (for build/client-side)
   - Location: Site Settings → Environment variables
   - Used by: Build process, client-side code (VITE_* vars)

2. **Function Environment Variables** (for serverless functions)
   - Location: Site Settings → Functions → Environment variables
   - Used by: Netlify Functions at runtime
   - **THIS IS OFTEN MISSING!**

**The Problem:**
- You copied env vars to Site Settings
- But functions need them in **Functions → Environment variables**
- OR they need to be set with the correct context (Production)

**Fix:**
1. Go to Netlify Dashboard → Site Settings → Functions
2. Check "Environment variables" section
3. Ensure all server-side vars are there:
   - `NOVA_POSHTA_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `LIQPAY_PUBLIC_KEY`
   - `LIQPAY_PRIVATE_KEY`
   - etc.

### 3. **Different Build Contexts**

**Check:**
- Domain A: What context is it using? (Production, Branch Deploy, etc.)
- Domain B: What context is it using?
- Environment variables can be scoped to specific contexts

**Fix:**
- Ensure env vars are set for "Production" context (or "All contexts")
- Not just "Branch deploys" or "Deploy previews"

### 4. **Functions Directory Not in Git**

**Check:**
```bash
git ls-files netlify/functions/
```

**If empty or missing files:**
- Functions aren't in the repository
- Netlify can't deploy what's not in git
- Domain A might have them from an older commit

**Fix:**
- Ensure all function files are committed
- Check `.gitignore` doesn't exclude `netlify/functions/`

### 5. **Different Netlify Sites/Accounts**

**Check:**
- Are both sites connected to the same git repository?
- Are they on the same Netlify account/team?
- Do they have the same build settings?

**Possible issues:**
- Different build commands
- Different Node versions
- Different function configurations

### 6. **Build Command Differences**

**Check `netlify.toml` on both sites:**
- Domain A: What's the build command?
- Domain B: What's the build command?
- Should be: `npm run build:client`

**Also check:**
- `functions = "netlify/functions"` is set
- `publish = "dist/spa"` is set

## Diagnostic Steps

### Step 1: Compare Function Lists

**Domain A (Working):**
1. Go to Netlify Dashboard → Site → Functions
2. List all functions
3. Note which ones exist

**Domain B (Broken):**
1. Go to Netlify Dashboard → Site → Functions
2. List all functions
3. Compare with Domain A

**If Domain B is missing functions:** They weren't deployed

### Step 2: Compare Build Logs

**Domain A:**
- Latest deploy → Build log
- Look for: "Packaging Functions..."
- Note which functions were packaged

**Domain B:**
- Latest deploy → Build log
- Compare with Domain A
- If "Packaging Functions..." is missing, functions weren't built

### Step 3: Compare Environment Variables

**Domain A:**
- Site Settings → Environment variables
- Functions → Environment variables
- List all vars (names only, not values)

**Domain B:**
- Site Settings → Environment variables
- Functions → Environment variables
- Compare lists

**If Domain B is missing vars in Functions section:** That's the problem!

### Step 4: Test Functions Directly

**Domain A:**
```
https://coffee-manifest.netlify.app/.netlify/functions/settlements?cityName=Київ
```

**Domain B:**
```
https://manifestcoffee.com.ua/.netlify/functions/settlements?cityName=Київ
```

**If Domain B returns 404:** Function doesn't exist
**If Domain B returns error:** Function exists but has issues (env vars, code, etc.)

## Most Likely Cause

Based on the symptoms (404 errors, HTML instead of JSON), the most likely cause is:

**Functions are not deployed on Domain B**

This happens when:
1. The build didn't complete successfully
2. Functions directory wasn't in the git commit
3. Netlify didn't detect the functions
4. Build was cached and didn't include functions

## Quick Fix

1. **Verify functions are in git:**
   ```bash
   git ls-files netlify/functions/
   ```

2. **Trigger fresh deploy on Domain B:**
   - Netlify Dashboard → Deploys
   - "Trigger deploy" → "Clear cache and deploy site"

3. **Check Functions tab after deploy:**
   - Should see: `settlements`, `warehouses`, `prepare-order`, etc.

4. **If functions still missing:**
   - Check build logs for errors
   - Verify `netlify.toml` has `functions = "netlify/functions"`
   - Ensure all function files are committed to git

5. **Set Function Environment Variables:**
   - Site Settings → Functions → Environment variables
   - Add all server-side vars (NOVA_POSHTA_API_KEY, etc.)

## Comparison Checklist

Use this to compare Domain A vs Domain B:

- [ ] Functions tab: Same functions listed?
- [ ] Build logs: "Packaging Functions..." present?
- [ ] Environment variables (Site): Same vars?
- [ ] Environment variables (Functions): Same vars?
- [ ] Build command: Same?
- [ ] Node version: Same?
- [ ] Git repository: Same branch/commit?
- [ ] netlify.toml: Same configuration?
- [ ] Function files in git: All committed?

## Expected Result After Fix

- ✅ Functions listed in Functions tab
- ✅ Direct function URLs work: `/.netlify/functions/settlements`
- ✅ Redirected URLs work: `/api/settlements`
- ✅ Returns JSON, not HTML
- ✅ No 404 errors






