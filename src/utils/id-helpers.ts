
/**
 * Utility functions for handling IDs and UUIDs
 */

/**
 * Checks if a string is a valid UUID
 */
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Converts a numeric ID to a demo UUID format
 * For development purposes only
 */
export const numericToUUID = (id: string | number): string => {
  // Pad the number with zeros to make it 32 chars
  const numStr = String(id).padStart(32, '0');
  // Format as UUID
  return `${numStr.slice(0, 8)}-${numStr.slice(8, 12)}-${numStr.slice(12, 16)}-${numStr.slice(16, 20)}-${numStr.slice(20)}`;
};

/**
 * Safe way to extract ID from route params - handles both numeric IDs and UUIDs
 */
export const getIdFromParams = (id: string | undefined): string | null => {
  if (!id) return null;

  // If it's a valid UUID, use it directly
  if (isValidUUID(id)) {
    return id;
  }
  
  // If it's a numeric ID, try to convert to a fake UUID
  if (/^\d+$/.test(id)) {
    console.log(`Using numeric ID for demo purposes: ${id}`);
    return numericToUUID(id);
  }
  
  console.warn(`Invalid ID format: ${id}`);
  return null;
};
