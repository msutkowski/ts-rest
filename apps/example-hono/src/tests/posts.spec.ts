import { describe, expect, it } from 'vitest';
import app from '../main';

describe('Posts Endpoints', () => {
  it('GET /posts should return an array of posts', async () => {
    const res = await app.fetch(
      new Request('http://0.0.0.0/posts?skip=0&take=10'),
      bindings
    );

    expect(res.status).toStrictEqual(200);
  });

  it('should transform skip and take into numbers', async () => {
    const res = await app.fetch(
      new Request('http://0.0.0.0/posts?skip=0&take=10'),
      bindings
    );
    const body = await res.json();

    expect(res.status).toStrictEqual(200);
    expect(body.skip).toStrictEqual(0);
    expect(body.take).toStrictEqual(10);
  });

  it('should error if a required query param is missing', async () => {
    const res = await app.fetch(
      new Request('http://0.0.0.0/posts?skip=0'),
      bindings
    );
    const body = await res.json();

    expect(res.status).toStrictEqual(400);
    expect(body).toStrictEqual({
      issues: [
        {
          code: 'invalid_type',
          expected: 'string',
          message: 'Required',
          path: ['take'],
          received: 'undefined',
        },
      ],
      name: 'ZodError',
    });
  });

  it('should error if body is incorrect', async () => {
    const res = await app.fetch(
      new Request('http://0.0.0.0/posts?skip=0', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Good title',
          content: 123,
        }),
      }),
      bindings
    );
    const body = await res.json();

    expect(res.status).toStrictEqual(400);
    expect(body).toStrictEqual({
      issues: [
        {
          code: 'invalid_type',
          expected: 'string',
          message: 'Expected string, received number',
          path: ['content'],
          received: 'number',
        },
      ],
      name: 'ZodError',
    });
  });

  it.only('should transform body correctly', async () => {
    const res = await app.fetch(
      new Request('http://0.0.0.0/posts', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Title with extra spaces     ',
          content: 'content',
        }),
      }),
      bindings
    );
    const body = await res.json();

    expect(res.status).toStrictEqual(201);
    expect(body.title).toStrictEqual('Title with extra spaces');
  });

  it('should format params using pathParams correctly', async () => {
    const res = await app.fetch(
      new Request('http://0.0.0.0/test/123/name', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Title with extra spaces     ',
          content: 'content',
        }),
      }),
      bindings
    );
    const body = await res.json();

    expect(res.status).toStrictEqual(200);
    expect(body).toStrictEqual({
      id: 123,
      name: 'name',
    });
  });
});
