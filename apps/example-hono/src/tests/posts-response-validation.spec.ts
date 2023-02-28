import { describe, it, expect } from 'vitest';
import app from '../main';

describe('Posts Endpoints w/ Response Validation', () => {
  it('should include default value and removes extra field', async () => {
    const res = await app.fetch(
      new Request('http://0.0.0.0/validate-response/123/name?field=foo'),
      bindings
    );
    const body = await res.json();

    expect(res.status).toStrictEqual(200);
    expect(body).toStrictEqual({
      id: 123,
      name: 'name',
      defaultValue: 'hello world',
    });
  });

  it('fails with invalid field', async () => {
    const res = await app.fetch(
      new Request('http://0.0.0.0/validate-response/2000/name'),
      bindings
    );
    const body = await res.json();

    expect(res.status).toStrictEqual(500);
    expect(body).toStrictEqual({});
  });
});
