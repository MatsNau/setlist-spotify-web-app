import setlistService from '../services/setlistService.js';

export const getSetlistById = async (req, res) => {
  try {
    const { id } = req.params;
    const setlist = await setlistService.getSetlistById(id);
    res.json(setlist);
  } catch (error) {
    console.error('Setlist API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'Setlist not found' });
    } else if (error.response?.status === 403) {
      res.status(403).json({ error: 'Invalid API key' });
    } else {
      res.status(500).json({ error: 'Failed to fetch setlist' });
    }
  }
};

export const getSetlistFromUrl = async (req, res) => {
  try {
    const { url } = req.body;
    const setlist = await setlistService.getSetlistFromUrl(url);
    res.json(setlist);
  } catch (error) {
    console.error('URL Parse Error:', error.response?.data || error.message);
    console.error('Full error:', error);
    
    if (error.message === 'URL is required') {
      return res.status(400).json({ error: error.message });
    } else if (error.message === 'Invalid setlist URL') {
      return res.status(400).json({ error: error.message });
    } else if (error.message === 'Server configuration error') {
      return res.status(500).json({ error: error.message });
    } else if (error.response?.status === 403) {
      res.status(403).json({ error: 'Invalid API key' });
    } else {
      res.status(500).json({ error: 'Failed to fetch setlist from URL' });
    }
  }
};