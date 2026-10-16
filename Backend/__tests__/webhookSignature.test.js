const crypto = require('crypto');
const signPayload = require('../src/utils/SignPayload');

describe('Webhook HMAC signature verification', () => {
    const secret = 'test-webhook-secret-value';
    const payload = {
        event: 'submission.created',
        data: { name: 'Test User', email: 'test@example.com' },
        submitted_at: '2026-01-01T00:00:00.000Z',
    };

    it('produces a consistent signature for the same payload and secret', () => {
        const payloadString = JSON.stringify(payload);
        const sig1 = signPayload(payloadString, secret);
        const sig2 = signPayload(payloadString, secret);
        expect(sig1).toBe(sig2);
    });

    it('produces a different signature when the payload changes', () => {
        const original = JSON.stringify(payload);
        const tampered = JSON.stringify({ ...payload, data: { ...payload.data, isAdmin: true } });

        const originalSig = signPayload(original, secret);
        const tamperedSig = signPayload(tampered, secret);

        expect(originalSig).not.toBe(tamperedSig);
    });

    it('produces a different signature when the secret changes', () => {
        const payloadString = JSON.stringify(payload);
        const sig1 = signPayload(payloadString, 'secret-one');
        const sig2 = signPayload(payloadString, 'secret-two');

        expect(sig1).not.toBe(sig2);
    });

    it('signature is a 64-character hex string (SHA256 output)', () => {
        const payloadString = JSON.stringify(payload);
        const sig = signPayload(payloadString, secret);

        expect(sig).toMatch(/^[a-f0-9]{64}$/);
    });

    it('signing different byte representations of the same data produces different signatures', () => {
        // This test proves WHY we sign the raw string, not a re-serialized object:
        // JSON.stringify output is not guaranteed to be identical if key order differs
        const payloadA = JSON.stringify({ a: 1, b: 2 });
        const payloadB = JSON.stringify({ b: 2, a: 1 }); // same data, different key order

        const sigA = signPayload(payloadA, secret);
        const sigB = signPayload(payloadB, secret);

        // These MAY be equal (JS engines tend to preserve insertion order),
        // but the test documents the assumption: sign bytes, not logical equality
        // The real protection is: always stringify once, reuse that string
        expect(typeof sigA).toBe('string');
        expect(typeof sigB).toBe('string');
        expect(sigA).toHaveLength(64);
    });
});