# Deployment Audit Checklist: Domain A vs Domain B

## Quick Links
- **Domain A (Working)**: coffee-manifest.netlify.app
- **Domain B (Broken)**: manifestcoffee.com.ua

## 1. Environment Variables Check

### Run Diagnostic Endpoint
Visit both deployments and compare:
- Domain A: `https://coffee-manifest.netlify.app/.netlify/functions/env-check`
- Domain B: `https://manifestcoffee.com.ua/.netlify/functions/env-check`

**Compare:**
- [ ] All `client` vars present on both
- [ ] All `server` vars present on both
- [ ] No vars with quotes (`"value"` instead of `value`)
- [ ] No vars with leading/trailing spaces
- [ ] Same `length` for each var (indicates same value)
- [ ] Same `preview` for each var (first 4 chars match)

### Required Environment Variables

#### Client-Side (VITE_* - Must be set in Netlify Site Settings)
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_LIQPAY_PUBLIC_KEY`
- [ ] `VITE_LIQPAY_PRIVATE_KEY` (⚠️ Should NOT be client-side, but code uses it)
- [ ] `VITE_EMAILJS_SERVICE_ID`
- [ ] `VITE_EMAILJS_TEMPLATE_ID_CUSTOMER`
- [ ] `VITE_EMAILJS_TEMPLATE_ID_ADMIN`
- [ ] `VITE_EMAILJS_PUBLIC_KEY`
- [ ] `VITE_ADMIN_EMAILS`
- [ ] `VITE_GOOGLE_MAPS_API_KEY`
- [ ] `VITE_NOVA_POSHTA_API_KEY`
- [ ] `VITE_LIQPAY_SANDBOX`

#### Server-Side (Netlify Functions - Must be set in Function Environment)
- [ ] `SUPABASE_URL` (or `VITE_SUPABASE_URL`)
- [ ] `SUPABASE_ANON_KEY` (or `VITE_SUPABASE_ANON_KEY`)
- [ ] `LIQPAY_PUBLIC_KEY` (or `VITE_LIQPAY_PUBLIC_KEY`)
- [ ] `LIQPAY_PRIVATE_KEY` (or `VITE_LIQPAY_PRIVATE_KEY`)
- [ ] `EMAILJS_SERVICE_ID` (or `VITE_EMAILJS_SERVICE_ID`)
- [ ] `EMAILJS_TEMPLATE_ID_CUSTOMER` (or `VITE_EMAILJS_TEMPLATE_ID_CUSTOMER`)
- [ ] `EMAILJS_TEMPLATE_ID_ADMIN` (or `VITE_EMAILJS_TEMPLATE_ID_ADMIN`)
- [ ] `EMAILJS_PUBLIC_KEY` (or `VITE_EMAILJS_PUBLIC_KEY`)
- [ ] `ADMIN_EMAILS` (or `VITE_ADMIN_EMAILS`)
- [ ] `NOVA_POSHTA_API_KEY` (or `VITE_NOVA_POSHTA_API_KEY`)
- [ ] `LIQPAY_SANDBOX`

### ⚠️ CRITICAL: Netlify Function Environment Variables

**Netlify Functions have SEPARATE environment variables from the site!**

1. Go to Netlify Dashboard → Site Settings → Functions
2. Check "Environment variables" section
3. Ensure ALL server-side vars are set there
4. OR use `netlify.toml` with `[build.environment]` (but this only works for build-time)

**To set function env vars:**
```bash
# Via CLI
netlify env:set LIQPAY_PRIVATE_KEY "your-key" --context production

# Or in Dashboard: Site Settings → Environment variables → Functions
```

## 2. Third-Party Service Configuration

### Supabase
- [ ] **Allowed URLs**: Add `https://manifestcoffee.com.ua` to:
  - Dashboard → Authentication → URL Configuration → Site URL
  - Dashboard → Authentication → URL Configuration → Redirect URLs
- [ ] **CORS**: Check if CORS is enabled for the new domain
- [ ] **Project ID**: Verify both deployments use the SAME Supabase project

### LiqPay
- [ ] **Result URL**: Add `https://manifestcoffee.com.ua/basket?payment=return` to allowed result URLs
- [ ] **Server URL**: Add `https://manifestcoffee.com.ua/.netlify/functions/liqpay-callback` to webhook URLs
- [ ] **Sandbox Mode**: Verify `VITE_LIQPAY_SANDBOX` is set consistently

### EmailJS
- [ ] **Allowed Domains**: Add `manifestcoffee.com.ua` to allowed domains in EmailJS dashboard
- [ ] **Service ID**: Verify same service ID on both
- [ ] **Template IDs**: Verify same template IDs on both

### Google Maps API
- [ ] **API Key Restrictions**: 
  - Go to Google Cloud Console → APIs & Services → Credentials
  - Find your API key
  - Under "Application restrictions" → "HTTP referrers"
  - Add: `https://manifestcoffee.com.ua/*`
  - Add: `https://*.manifestcoffee.com.ua/*`

### Nova Poshta API
- [ ] **API Key**: Verify same API key on both deployments
- [ ] **No domain restrictions** (Nova Poshta API doesn't restrict by domain)

## 3. CORS Configuration

### Check Server CORS
The server uses `cors()` middleware which should allow all origins. Verify:

```typescript
// server/index.ts line 28
app.use(cors()); // Should allow all origins
```

### Test CORS Preflight
```bash
curl -i -X OPTIONS https://manifestcoffee.com.ua/api/ping \
  -H "Origin: https://manifestcoffee.com.ua" \
  -H "Access-Control-Request-Method: GET"
```

Expected: `Access-Control-Allow-Origin: *` or `Access-Control-Allow-Origin: https://manifestcoffee.com.ua`

## 4. Code-Level Issues

### Hardcoded Domains Found
- ✅ `sitemap.xml` - Only for SEO, not functional
- ✅ `window.location.origin` - Dynamic, should work on both domains
- ✅ Fallback values in code - Check if these are being used instead of env vars

### Potential Issues
1. **Basket.tsx line 74**: Uses `window.location.origin` - ✅ Should work
2. **Checkout.tsx**: Has fallback values for EmailJS - ⚠️ Check if env vars are missing
3. **Basket.tsx line 68**: Has fallback for LiqPay public key - ⚠️ Check if env vars are missing

## 5. Netlify-Specific Issues

### Build Settings
- [ ] **Build Command**: Same on both (`npm run build:client`)
- [ ] **Publish Directory**: Same on both (`dist/spa`)
- [ ] **Node Version**: Check if same (should be in `netlify.toml` or site settings)

### Function Settings
- [ ] **Function Directory**: Same on both (`netlify/functions`)
- [ ] **Node Bundler**: Same on both (`esbuild`)

### Environment Context
- [ ] **Production Context**: Verify env vars are set for "Production" context
- [ ] **Deploy Context**: Check if Domain B is using "Production" or "Branch Deploy"

## 6. Network & Browser Diagnostics

### Check Browser Console (Domain B)
- [ ] Open DevTools → Console
- [ ] Look for:
  - CORS errors
  - 401/403 errors
  - "Failed to fetch" errors
  - Environment variable warnings

### Check Network Tab (Domain B)
- [ ] Open DevTools → Network
- [ ] Try to trigger a failing feature
- [ ] Check failed requests:
  - Status code
  - Response body
  - Request headers
  - Response headers (especially CORS headers)

### Common Error Patterns
- **401 Unauthorized**: Missing or wrong API keys
- **403 Forbidden**: CORS or domain restrictions
- **CORS error**: Missing `Access-Control-Allow-Origin` header
- **Failed to fetch**: Network issue or function not deployed

## 7. Deployment Verification

### Fresh Deploy
- [ ] After setting env vars, trigger a **fresh production deploy**
- [ ] Don't rely on cache - do a "Clear cache and deploy site"
- [ ] Verify build logs show env vars are being read

### Build Logs Comparison
Compare build logs from both deployments:
- [ ] Look for "EMAILJS ENV CHECK" output (from server/index.ts)
- [ ] Verify env vars are logged (first few chars)
- [ ] Check for any build errors

## 8. Quick Fixes to Try

### Fix 1: Set Function Environment Variables
```bash
# On Domain B's Netlify site
netlify env:set LIQPAY_PRIVATE_KEY "your-key" --context production
netlify env:set SUPABASE_URL "your-url" --context production
# ... etc for all server-side vars
```

### Fix 2: Verify Environment Context
- Go to Netlify Dashboard → Site Settings → Environment variables
- Ensure vars are set for "Production" context (not just "All contexts")

### Fix 3: Clear Cache and Redeploy
- Netlify Dashboard → Deploys → Trigger deploy → "Clear cache and deploy site"

### Fix 4: Check Function Logs
- Netlify Dashboard → Functions → View logs
- Look for errors when functions are called
- Check if env vars are undefined in logs

## 9. Diagnostic Commands

### Check Env Vars via CLI
```bash
# List all env vars for Domain B
netlify env:list --context production

# Compare with Domain A (if you have access)
# Export from Domain A, import to Domain B
```

### Test Functions Locally
```bash
# Test function with env vars
netlify dev

# Check function logs
netlify functions:log
```

## 10. Success Criteria

- [ ] All env vars present on Domain B match Domain A
- [ ] No CORS errors in browser console
- [ ] All API calls return 200 (not 401/403)
- [ ] Functions execute without errors
- [ ] Third-party services accept requests from Domain B
- [ ] Same functionality works on both domains

## Next Steps

1. Run the diagnostic endpoint on both domains
2. Compare the JSON outputs
3. Fix any missing env vars
4. Update third-party service configurations
5. Clear cache and redeploy
6. Test all features on Domain B






