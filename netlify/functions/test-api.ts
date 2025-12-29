import { Handler } from '@netlify/functions';

/**
 * Simple test endpoint to verify Netlify functions are working
 * Access at: /.netlify/functions/test-api or /api/test
 */
export const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      success: true,
      message: 'Netlify function is working!',
      path: event.path,
      method: event.httpMethod,
      timestamp: new Date().toISOString(),
      deployment: {
        url: process.env.URL || 'unknown',
        context: process.env.CONTEXT || 'unknown',
      },
    }),
  };
};






