export const getHealth = (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
};