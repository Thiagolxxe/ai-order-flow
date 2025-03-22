
/**
 * Validates if a string is a valid UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  // This regex pattern checks for a standard UUID format
  // xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx where x is a hexadecimal digit
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Generates a mock UUID for testing purposes
 */
export const generateMockUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Generates a test ID with a specific format for development
 */
export const generateTestID = (prefix: string = 'test'): string => {
  return generateMockUUID();
};

/**
 * Gets a validated ID from URL parameters
 * If the ID is not a valid UUID, returns null
 */
export const getIdFromParams = (id: string | undefined): string | null => {
  if (!id) return null;
  return isValidUUID(id) ? id : null;
};

/**
 * Test UUIDs for development and testing
 */
export const TEST_UUIDS = {
  USER_1: '00000000-0000-0000-0000-000000000u01',
  USER_2: '00000000-0000-0000-0000-000000000u02',
  USER_3: '00000000-0000-0000-0000-000000000u03',
  USER_4: '00000000-0000-0000-0000-000000000u04',
  USER_5: '00000000-0000-0000-0000-000000000u05',
  RESTAURANT_1: '00000000-0000-0000-0000-000000000r01',
  RESTAURANT_2: '00000000-0000-0000-0000-000000000r02',
  ORDER_1: '00000000-0000-0000-0000-000000000o01',
  DELIVERY_1: '00000000-0000-0000-0000-000000000d01'
};
