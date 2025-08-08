import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  host: '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback'
  },
  
  setlist: {
    apiKey: process.env.SETLIST_API_KEY
  },
  
  client: {
    url: process.env.CLIENT_URL
  }
};

export const validateConfig = () => {
  const requiredEnvVars = ['SETLIST_API_KEY', 'SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET'];
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingEnvVars.length > 0) {
    console.warn('⚠️  Missing environment variables:', missingEnvVars.join(', '));
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  return true;
};