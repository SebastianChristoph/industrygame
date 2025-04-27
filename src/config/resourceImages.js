// Resource image mapping functions
// Maps resource IDs to their corresponding image paths

const PLACEHOLDER_ICON = '/images/icons/placeholder.png';
const PLACEHOLDER_PRODUCTION = '/images/production/Placeholder.png';

// Helper function to convert resource ID to image filename
const resourceIdToImageName = (resourceId) => {
  // First try with lowercase
  const lowercaseName = resourceId.toLowerCase();
  // Then try with first letter capitalized
  const capitalizedName = resourceId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('_');
  
  return {
    lowercase: lowercaseName,
    capitalized: capitalizedName
  };
};

// Maps resource IDs to their icon image paths
export const getResourceIcon = (resourceId) => {
  const { lowercase, capitalized } = resourceIdToImageName(resourceId);
  return `/images/icons/${capitalized}.png`;
};

// Maps resource IDs to their production image paths
export const getResourceProductionImage = (resourceId) => {
  const { lowercase, capitalized } = resourceIdToImageName(resourceId);
  return `/images/production/${capitalized}.png`;
};

// Fallback function to handle missing images
export const getResourceImageWithFallback = (resourceId, type = 'icon') => {
  const imagePath = type === 'icon' 
    ? getResourceIcon(resourceId)
    : getResourceProductionImage(resourceId);
  
  const placeholder = type === 'icon' 
    ? PLACEHOLDER_ICON 
    : PLACEHOLDER_PRODUCTION;

  // You can implement image existence checking here if needed
  // For now, we'll just return the path and let the browser handle 404s
  return imagePath;
}; 