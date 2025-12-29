import { Handler } from '@netlify/functions';

/**
 * Diagnostic endpoint to check environment variables
 * Access at: /.netlify/functions/env-check
 * 
 * This helps compare env vars between deployments
 */
export const handler: Handler = async (event, context) => {
  // List of expected environment variables
  const expectedVars = {
    // Client-side (VITE_*)
    client: [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_LIQPAY_PUBLIC_KEY',
      'VITE_LIQPAY_PRIVATE_KEY',
      'VITE_EMAILJS_SERVICE_ID',
      'VITE_EMAILJS_TEMPLATE_ID_CUSTOMER',
      'VITE_EMAILJS_TEMPLATE_ID_ADMIN',
      'VITE_EMAILJS_PUBLIC_KEY',
      'VITE_ADMIN_EMAILS',
      'VITE_GOOGLE_MAPS_API_KEY',
      'VITE_NOVA_POSHTA_API_KEY',
      'VITE_LIQPAY_SANDBOX',
    ],
    // Server-side (no prefix or different names)
    server: [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'LIQPAY_PUBLIC_KEY',
      'LIQPAY_PRIVATE_KEY',
      'EMAILJS_SERVICE_ID',
      'EMAILJS_TEMPLATE_ID_CUSTOMER',
      'EMAILJS_TEMPLATE_ID_ADMIN',
      'EMAILJS_PUBLIC_KEY',
      'ADMIN_EMAILS',
      'GOOGLE_MAPS_API_KEY',
      'NOVA_POSHTA_API_KEY',
      'LIQPAY_SANDBOX',
    ],
  };

  // Check which vars are present (without exposing values)
  const checkVars = (vars: string[]) => {
    return vars.map(varName => {
      const value = process.env[varName];
      return {
        name: varName,
        present: !!value,
        length: value ? value.length : 0,
        // Show first 4 chars for verification (safe)
        preview: value ? `${value.substring(0, 4)}...` : 'missing',
        // Check for common issues
        hasQuotes: value ? (value.startsWith('"') && value.endsWith('"')) : false,
        hasNewlines: value ? value.includes('\n') : false,
        hasSpaces: value ? (value.startsWith(' ') || value.endsWith(' ')) : false,
      };
    });
  };

  const clientVars = checkVars(expectedVars.client);
  const serverVars = checkVars(expectedVars.server);

  // Get deployment info
  const deploymentInfo = {
    siteUrl: process.env.URL || 'unknown',
    deployUrl: process.env.DEPLOY_PRIME_URL || 'unknown',
    branch: process.env.BRANCH || 'unknown',
    context: process.env.CONTEXT || 'unknown',
    nodeVersion: process.version,
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // Allow CORS for diagnostics
    },
    body: JSON.stringify({
      deployment: deploymentInfo,
      timestamp: new Date().toISOString(),
      environment: {
        client: clientVars,
        server: serverVars,
      },
      summary: {
        clientPresent: clientVars.filter(v => v.present).length,
        clientTotal: clientVars.length,
        serverPresent: serverVars.filter(v => v.present).length,
        serverTotal: serverVars.length,
      },
      issues: {
        missingClient: clientVars.filter(v => !v.present).map(v => v.name),
        missingServer: serverVars.filter(v => !v.present).map(v => v.name),
        hasQuotes: [...clientVars, ...serverVars].filter(v => v.hasQuotes).map(v => v.name),
        hasNewlines: [...clientVars, ...serverVars].filter(v => v.hasNewlines).map(v => v.name),
        hasSpaces: [...clientVars, ...serverVars].filter(v => v.hasSpaces).map(v => v.name),
      },
    }, null, 2),
  };
};






