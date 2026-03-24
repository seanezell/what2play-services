const { isValidUsername } = require('./usernameValidation');

describe('isValidUsername', () => {
    it('accepts 3–20 alphanumeric with _-', () => {
        expect(isValidUsername('ab3')).toBe(true);
        expect(isValidUsername('user_name-1')).toBe(true);
    });

    it('rejects too short or too long', () => {
        expect(isValidUsername('ab')).toBe(false);
        expect(isValidUsername('a'.repeat(21))).toBe(false);
    });

    it('rejects spaces and invalid characters', () => {
        expect(isValidUsername('bad name')).toBe(false);
        expect(isValidUsername('bad!')).toBe(false);
    });
});
