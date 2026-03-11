const { v4: uuidv4, validate: validateUUID } = require('uuid');

describe('UUID Validation', () => {
  test('should generate valid UUID', () => {
    const uuid = uuidv4();
    expect(validateUUID(uuid)).toBe(true);
  });

  test('should reject invalid UUID', () => {
    expect(validateUUID('not-a-uuid')).toBe(false);
  });

  test('should reject null UUID', () => {
    expect(validateUUID(null)).toBe(false);
  });

  test('should validate UUID format correctly', () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440000';
    expect(validateUUID(validUUID)).toBe(true);
  });
});
