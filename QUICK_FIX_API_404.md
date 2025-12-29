# Quick Fix: API 404 Errors on New Domain

## Immediate Actions Required

### 1. Verify Functions Are Deployed

**In Netlify Dashboard for `manifestcoffee.com.ua`:**
1. Go to **Functions** tab
2. Check if these functions are listed:
   - `api`
   - `prepare-order`
   - `liqpay-signature`

**If functions are MISSING:**
- Functions aren't being deployed
- Trigger a fresh deploy: **Deploys → Trigger deploy → Clear cache and deploy site**

### 2. Test Functions Directly (Bypass Redirects)

Test these URLs directly in your browser:

```
https://manifestcoffee.com.ua/.netlify/functions/api/settlements?cityName=Київ
https://manifestcoffee.com.ua/.netlify/functions/prepare-order
https://manifestcoffee.com.ua/.netlify/functions/test-api
```

**Expected:** JSON response
**If you get 404:** Functions aren't deployed

### 3. Check Build Logs

In Netlify Dashboard → Deploys → [Latest Deploy] → Build log:

Look for:
```
Packaging Functions...
Packaging function: api
Packaging function: prepare-order
```

**If you don't see this:** Functions aren't being packaged

### 4. Most Likely Issue: Functions Not Deployed

**Solution:**
1. Ensure `netlify/functions/` directory is in your git repository
2. Push the latest code
3. Trigger a fresh deploy on Netlify
4. Wait for build to complete
5. Check Functions tab again

### 5. Verify netlify.toml Configuration

Ensure your `netlify.toml` has:
```toml
[build]
  functions = "netlify/functions"  # ← This is critical

[functions]
  external_node_modules = ["express", "@supabase/supabase-js"]
  node_bundler = "esbuild"
```

### 6. Check .gitignore

Make sure `netlify/functions/` is NOT in `.gitignore`:
```bash
# Should NOT be ignored
netlify/functions/
```

### 7. Force Redeploy

After verifying the above:
1. Netlify Dashboard → Deploys
2. Click "Trigger deploy"
3. Select "Clear cache and deploy site"
4. Wait for completion
5. Test API endpoints again

## Diagnostic URLs

Test these in order:

1. **Test function directly:**
   ```
   https://manifestcoffee.com.ua/.netlify/functions/test-api
   ```

2. **Test via redirect:**
   ```
   https://manifestcoffee.com.ua/api/test
   ```

3. **Test settlements:**
   ```
   https://manifestcoffee.com.ua/.netlify/functions/api/settlements?cityName=Київ
   ```

4. **Test via redirect:**
   ```
   https://manifestcoffee.com.ua/api/settlements?cityName=Київ
   ```

## If Functions Still Don't Work

1. **Compare with working domain:**
   - Check `coffee-manifest.netlify.app` Functions tab
   - See which functions are deployed there
   - Compare with `manifestcoffee.com.ua`

2. **Check site settings:**
   - Both sites should have same build command
   - Both should have `functions = "netlify/functions"` in netlify.toml
   - Both should be connected to the same git repo

3. **Check repository:**
   - Ensure `netlify/functions/` directory exists in the repo
   - All function files are committed
   - No `.gitignore` excluding them

## Expected Result

After fix:
- ✅ `/.netlify/functions/api/settlements` returns JSON
- ✅ `/api/settlements` returns JSON (via redirect)
- ✅ No more "Unexpected token '<'" errors
- ✅ No more 404 errors






