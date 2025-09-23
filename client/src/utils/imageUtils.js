/**
 * Utility functions for handling image URLs
 */

/**
 * Get the base URL for images by removing '/api' from the API URL
 * @returns {string} Base URL for images
 */
export const getImageBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error('VITE_API_URL environment variable is required');
  }
  return apiUrl.replace('/api', '');
};

/**
 * Build a complete image URL from a relative path
 * @param {string} imagePath - Relative path to the image
 * @returns {string} Complete image URL
 */
export const buildImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath; // Already a complete URL
  
  const baseUrl = getImageBaseUrl();
  return `${baseUrl}${imagePath}`;
};
