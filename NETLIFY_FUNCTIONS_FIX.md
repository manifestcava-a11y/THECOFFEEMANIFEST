# Fix: API Endpoints Returning 404 on New Domain

## Problem
- `/api/settlements` returns HTML (404 page) instead of JSON
- `/api/orders/prepare` returns 404
- Error: `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON`

## Root Cause
The Netlify functions are not being deployed or routed correctly on the new domain.

## Solution Steps

### 1. Verify Functions Are Deployed

**Check Netlify Dashboard:**
1. Go to your Netlify site dashboard for `manifestcoffee.com.ua`
2. Navigate to **Functions** tab
3. Verify these functions exist:
   - `api`
   - `prepare-order`
   - `liqpay-signature`
   - `liqpay-callback`
   - `sitemap`
   - `env-check`
   - `test-api`

**If functions are missing:**
- The build might not be including the functions
- Check build logs for errors
- Ensure `netlify/functions` directory is in the repository

### 2. Verify Build Configuration

**In `netlify.toml`:**
```toml
[build]
  command = "npm run build:client"
  functions = "netlify/functions"  # ← This tells Netlify where functions are
  publish = "dist/spa"
```

**Important:** Netlify automatically detects and deploys functions from the `netlify/functions` directory. No build step needed for functions themselves.

### 3. Check Redirect Order

The redirects in `netlify.toml` should work, but verify the order:

1. Specific API routes (like `/api/orders/prepare`) come first
2. Generic catch-all (`/api/*`) comes last
3. SPA catch-all (`/*`) in `_redirects` comes after all API routes

### 4. Test Functions Directly

Test if functions are accessible directly (bypassing redirects):

- `https://manifestcoffee.com.ua/.netlify/functions/api/settlements?cityName=Київ`
- `https://manifestcoffee.com.ua/.netlify/functions/prepare-order` (POST)
- `https://manifestcoffee.com.ua/.netlify/functions/test-api`

If these work but `/api/*` routes don't, it's a redirect issue.
If these don't work, the functions aren't deployed.

### 5. Force Redeploy

After making changes:
1. Go to Netlify Dashboard → Deploys
2. Click "Trigger deploy" → "Clear cache and deploy site"
3. Wait for build to complete
4. Check Functions tab to verify functions are listed

### 6. Check Build Logs

In Netlify Dashboard → Deploys → [Latest Deploy] → Build log:

Look for:
- `Packaging Functions...`
- `Packaging function: api`
- `Packaging function: prepare-order`
- Any errors about missing files or build failures

### 7. Verify Function Files Exist

Ensure these files exist in the repository:
- `netlify/functions/api.ts`
- `netlify/functions/prepare-order.ts`
- `netlify/functions/liqpay-signature.ts`
- `netlify/functions/liqpay-callback.ts`
- `netlify/functions/sitemap.ts`
- `netlify/functions/env-check.ts`
- `netlify/functions/test-api.ts`

### 8. Common Issues

**Issue: Functions not in git**
- Make sure `netlify/functions/` directory is committed to git
- Check `.gitignore` doesn't exclude it

**Issue: TypeScript functions not compiling**
- Netlify should auto-compile TypeScript functions
- If not, check `netlify.toml` has correct `node_bundler` setting

**Issue: Missing dependencies**
- Functions need dependencies listed in `netlify.toml`:
  ```toml
  [functions]
    external_node_modules = ["express", "@supabase/supabase-js"]
  ```

**Issue: Environment variables not available to functions**
- Functions have separate env vars from the site
- Set them in: Site Settings → Functions → Environment variables
- OR use CLI: `netlify env:set VAR_NAME "value" --context production`

## Quick Diagnostic Commands

### Test API endpoint directly:
```bash
curl https://manifestcoffee.com.ua/.netlify/functions/test-api
```

### Test via redirect:
```bash
curl https://manifestcoffee.com.ua/api/test
```

### Test settlements endpoint:
```bash
curl "https://manifestcoffee.com.ua/.netlify/functions/api/settlements?cityName=Київ"
```

## Expected Behavior

✅ **Working:**
- Direct function URL returns JSON: `/.netlify/functions/api/settlements`
- Redirected URL returns JSON: `/api/settlements`
- Response has `Content-Type: application/json`

❌ **Broken:**
- Returns HTML (404 page)
- Returns `<!doctype html>`
- 404 status code

## Next Steps

1. Check Netlify Dashboard → Functions tab
2. Verify functions are listed
3. Test direct function URLs
4. If functions exist but redirects don't work, check redirect order
5. If functions don't exist, trigger a fresh deploy
6. Check build logs for errors






