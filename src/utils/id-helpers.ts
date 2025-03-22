/**
 * Utility functions for handling IDs and UUIDs
 */

// Standard test UUIDs for development and testing
export const TEST_UUIDS = {
  // User IDs
  USER_1: '00000000-0000-0000-0000-000000000001',
  USER_2: '00000000-0000-0000-0000-000000000002',
  USER_3: '00000000-0000-0000-0000-000000000003',
  USER_4: '00000000-0000-0000-0000-000000000004',
  USER_5: '00000000-0000-0000-0000-000000000005',
  
  // Restaurant IDs
  RESTAURANT_1: '00000000-0000-0000-0000-000000000r01',
  RESTAURANT_2: '00000000-0000-0000-0000-000000000r02',
  
  // Order IDs
  ORDER_1: '00000000-0000-0000-0000-00000000pd01',
  ORDER_2: '00000000-0000-0000-0000-00000000pd02',
  ORDER_3: '00000000-0000-0000-0000-00000000pd03',
};

/**
 * Checks if a string is a valid UUID
 */
export const isValidUUID = (id: string): boolean => {
  // First, check for our test UUIDs
  const testUUIDs = Object.values(TEST_UUIDS);
  if (testUUIDs.includes(id)) {
    return true;
  }
  
  // Then check the standard UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Converts a numeric ID to a demo UUID format
 * For development purposes only
 */
export const numericToUUID = (id: string | number): string => {
  // Check if the ID is a small number (1, 2, 3) - map to our test UUIDs for demo
  const numId = Number(id);
  if (!isNaN(numId) && numId > 0 && numId <= 3) {
    // If it's a restaurant ID (assume small numbers are restaurants)
    return TEST_UUIDS[`RESTAURANT_${numId}` as keyof typeof TEST_UUIDS] || '';
  }
  
  // Otherwise, use the standard padding approach
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

/**
 * Get a demo user ID for testing when no real auth is available
 */
export const getDemoUserId = (): string => {
  return TEST_UUIDS.USER_1;
};

/**
 * Check if an ID is one of our demo/test IDs
 */
export const isTestId = (id: string | undefined): boolean => {
  if (!id) return false;
  return Object.values(TEST_UUIDS).includes(id);
};
