import { validateClient } from '../../src/utils/validation';

test('rejects empty client name', () => {
    const { valid, errors } = validateClient({ name: '' });
    expect(valid).toBe(false);
    expect(errors.length).toBeGreaterThan(0);
});
