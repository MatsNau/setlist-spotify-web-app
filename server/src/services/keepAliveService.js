import axios from 'axios';
import { config } from '../config/environment.js';

class KeepAliveService {
  constructor() {
    this.interval = null;
    this.pingUrl = null;
  }

  start() {
    // Only run in production and if we have a ping URL
    if (config.nodeEnv !== 'production') {
      console.log('KeepAlive service disabled in development');
      return;
    }

    // Set ping URL - can be configured via environment variable
    this.pingUrl = process.env.RENDER_EXTERNAL_URL || process.env.PING_URL;
    
    if (!this.pingUrl) {
      console.log('No ping URL configured, KeepAlive service disabled');
      return;
    }

    console.log('🔄 Starting KeepAlive service...');
    console.log(`📍 Ping URL: ${this.pingUrl}`);
    
    // Ping every 14 minutes (Render sleeps after 15 minutes of inactivity)
    this.interval = setInterval(() => {
      this.ping();
    }, 14 * 60 * 1000);

    // Initial ping after 1 minute
    setTimeout(() => {
      this.ping();
    }, 60 * 1000);
  }

  async ping() {
    try {
      const pingEndpoint = `${this.pingUrl}/api/health`;
      const response = await axios.get(pingEndpoint, {
        timeout: 30000, // 30 second timeout
        headers: {
          'User-Agent': 'KeepAlive-Service'
        }
      });
      
      if (response.data.status === 'OK') {
        console.log(`✅ KeepAlive ping successful at ${new Date().toISOString()}`);
      }
    } catch (error) {
      console.error(`❌ KeepAlive ping failed at ${new Date().toISOString()}:`, error.message);
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('🛑 KeepAlive service stopped');
    }
  }
}

export default new KeepAliveService();