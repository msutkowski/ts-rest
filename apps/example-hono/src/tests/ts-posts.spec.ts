import { describe, expect, it } from 'vitest';
import app from '../main';

describe('TS Posts Endpoints', () => {
  it('GET /posts/1 should return a post', async () => {
    const res = await app.fetch(
      new Request('http://0.0.0.0/ts/posts/123'),
      bindings
    );
    const body = await res.json();

    expect(res.status).toStrictEqual(200);
    expect(body.id).toStrictEqual('123'); // Not "123" as a number, because no Zod transform
  });

  it('GET /posts should return posts with typed query params', async () => {
    const res = await app.fetch(
      new Request('http://0.0.0.0/ts/posts?skip=42&take=100'),
      bindings
    );
    const body = await res.json();

    expect(res.status).toStrictEqual(200);
    expect(body.skip).toStrictEqual(42);
    expect(body.take).toStrictEqual(100);
  });
});
