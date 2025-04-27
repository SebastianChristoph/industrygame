// Resource image mapping functions
// Maps resource IDs to their corresponding image paths

const PLACEHOLDER_ICON = '/images/icons/placeholder.png';
const PLACEHOLDER_PRODUCTION = '/images/production/Placeholder.png';

// Helper function to convert resource ID to image filename
const resourceIdToImageName = (resourceId) => {
  // First try with lowercase and underscores
  const lowercaseName = resourceId.toLowerCase();
  // Then try with first letter capitalized and underscores
  const capitalizedName = resourceId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('_');
  // Try with spaces (for files like 'Copper Wire.png')
  const spacedName = resourceId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  return {
    lowercase: lowercaseName,
    capitalized: capitalizedName,
    spaced: spacedName
  };
};

// Maps resource IDs to their icon image paths
export const getResourceIcon = (resourceId) => {
  const { lowercase, capitalized, spaced } = resourceIdToImageName(resourceId);
  // Return all possible variants for fallback handling in the component
  return [
    `/images/icons/${spaced}.png`,
    `/images/icons/${capitalized}.png`,
    `/images/icons/${lowercase}.png`
  ];
};

// Maps resource IDs to their production image paths
export const getResourceProductionImage = (resourceId) => {
  const { lowercase, capitalized } = resourceIdToImageName(resourceId);
  return `/images/production/${capitalized}.png`;
};

// Fallback function to handle missing images
export const getResourceImageWithFallback = (resourceId, type = 'icon') => {
  if (type === 'icon') {
    return getResourceIcon(resourceId);
  }
  return [`/images/production/${resourceIdToImageName(resourceId).capitalized}.png`];
}; 