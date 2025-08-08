import axios from 'axios';
import { config } from '../config/environment.js';

class SetlistService {
  constructor() {
    this.apiKey = config.setlist.apiKey;
    this.baseUrl = 'https://api.setlist.fm/rest/1.0';
  }

  async getSetlistById(id) {
    const response = await axios.get(
      `${this.baseUrl}/setlist/${id}`,
      {
        headers: {
          'x-api-key': this.apiKey,
          'Accept': 'application/json'
        }
      }
    );
    
    return response.data;
  }

  extractSetlistIdFromUrl(url) {
    const patterns = [
      /setlist\.fm\/setlist\/[^\/]+\/\d+\/[^\/]+-([a-f0-9]+)\.html/,
      /setlist\.fm\/.*-([a-f0-9]{8})\.html/,
      /([a-f0-9]{8})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }

  async getSetlistFromUrl(url) {
    console.log('Received URL:', url);
    
    if (!url) {
      throw new Error('URL is required');
    }
    
    const setlistId = this.extractSetlistIdFromUrl(url);
    console.log('Extracted ID:', setlistId);
    
    if (!setlistId) {
      throw new Error('Invalid setlist URL');
    }
    
    if (!this.apiKey) {
      console.error('SETLIST_API_KEY is not set!');
      throw new Error('Server configuration error');
    }
    
    console.log('Fetching from Setlist.fm API...');
    const setlist = await this.getSetlistById(setlistId);
    console.log('Setlist fetched successfully');
    
    return setlist;
  }
}

export default new SetlistService();