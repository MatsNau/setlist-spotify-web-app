import crypto from 'crypto';

export const generateRandomString = (length) => {
  return crypto.randomBytes(length).toString('hex');
};