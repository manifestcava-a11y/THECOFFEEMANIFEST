# Debugging Netlify Redirect Method Preservation

## Issue
The `/api/orders/prepare` endpoint is returning `{"error":"Method not allowed"}` even though the client is sending a POST request.

## Possible Causes

1. **Redirect not preserving HTTP method**: Netlify redirects with `status = 200` should proxy requests and preserve the method, but there might be an issue.

2. **CORS preflight**: The browser might be sending an OPTIONS request first, which should be handled, but then the actual POST might not be reaching the function.

3. **Redirect order**: The redirect might be getting overridden by another rule.

## Debugging Steps

### Step 1: Check Function Logs
After deploying, check Netlify Function logs:
- Netlify Dashboard → Functions → `prepare-order` → Logs
- Look for the debug output showing the HTTP method received
- The logs should show: `HTTP Method: POST` or `HTTP Method: GET` (or something else)

### Step 2: Test Function Directly
Test the function directly (bypassing the redirect):
```bash
curl -X POST https://manifestcoffee.com.ua/.netlify/functions/prepare-order \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

If this works, the issue is with the redirect.
If this doesn't work, the issue is with the function itself.

### Step 3: Check Redirect Configuration
The redirect in `netlify.toml` is:
```toml
[[redirects]]
  force = true
  from = "/api/orders/prepare"
  status = 200
  to = "/.netlify/functions/prepare-order"
```

This should proxy POST requests correctly. If it's not working, we might need to:
1. Remove the redirect and call the function directly from the client
2. Use a different redirect approach
3. Check if there's a conflict with other redirects

### Step 4: Check Browser Network Tab
In the browser DevTools → Network tab:
1. Look at the request to `/api/orders/prepare`
2. Check the Request Method (should be POST)
3. Check the Response (should show the error)
4. Check if there's a preflight OPTIONS request

## Solution Options

### Option 1: Call Function Directly (No Redirect)
Change the client to call the function directly:
```typescript
const res = await fetch("/.netlify/functions/prepare-order", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(orderPayload),
});
```

### Option 2: Fix Redirect (If that's the issue)
If the redirect isn't preserving the method, we might need to:
- Remove `force = true` (though this shouldn't affect method preservation)
- Ensure the redirect is before the SPA catch-all
- Check Netlify documentation for method preservation

### Option 3: Use Express Wrapper
Route through the Express wrapper function instead:
- Change redirect to point to `/.netlify/functions/api/orders/prepare`
- Ensure Express route handles POST correctly

## Current Status
- Debug logging added to function
- Function should log the received HTTP method
- After deployment, check logs to see what method is actually received






