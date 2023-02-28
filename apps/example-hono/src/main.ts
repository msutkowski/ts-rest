export type Bindings = {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  MY_KV_NAMESPACE: { doot: 'dang' };
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
};

import { initContract, ResponseValidationError } from '@ts-rest/core';
import { apiBlog, contractTs } from '@ts-rest/example-contracts';
import { createHonoEndpoints, initServer } from '@ts-rest/hono';
import { mockPostFixtureFactory } from './fixtures';
import { tsRouter } from './ts-router';
import { Hono, MiddlewareHandler } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono<{ Bindings: Bindings }>();
app.use('*', cors());

// Note: if we pin the tips here, we skip a whole lot of pain elsewhere in ts-rest-hono, and this matches what you'd expect with Hono?
const s = initServer<Bindings>();

const completedRouter = s.router(apiBlog, {
  getPost: async ({ params: { id } }) => {
    const post = mockPostFixtureFactory({ id });

    if (!post) {
      return {
        status: 404,
        body: null,
      };
    }

    return {
      status: 200,
      body: post,
    };
  },
  getPosts: async (reqCtx, env) => {
    console.log(env.MY_KV_NAMESPACE.doot === 'dang' ? 'yay' : 'nay');

    const posts = [
      mockPostFixtureFactory({ id: '1' }),
      mockPostFixtureFactory({ id: '2' }),
    ];

    return {
      status: 200,
      body: {
        posts,
        count: 0,
        skip: reqCtx.query.skip,
        take: reqCtx.query.take,
      },
    };
  },
  createPost: async ({ body }) => {
    const post = mockPostFixtureFactory(body);

    return {
      status: 201,
      body: post,
    };
  },
  updatePost: async ({ body }) => {
    const post = mockPostFixtureFactory(body);

    return {
      status: 200,
      body: post,
    };
  },
  deletePost: async () => {
    return {
      status: 200,
      body: { message: 'Post deleted' },
    };
  },
  testPathParams: async (thing, env) => {
    console.log(env.MY_KV_NAMESPACE.doot === 'dang' ? 'yay' : 'nay');

    return {
      status: 200,
      body: thing.params,
    };
  },
});

const validateResponseContact = initContract().router({
  testPathParams: {
    ...apiBlog.testPathParams,
    path: '/validate-response/:id/:name',
  },
});

// const openapi = generateOpenApi(apiBlog, {
//   info: { title: 'Play API', version: '0.1' },
// });

// const apiDocs = express.Router();

// apiDocs.use(serve);
// apiDocs.get('/', setup(openapi));

// app.use('/api-docs', apiDocs);

app.get('/test', (c) => {
  return c.json(c.req.query);
});

createHonoEndpoints(apiBlog, completedRouter, app);
createHonoEndpoints(contractTs, tsRouter, app, { jsonQuery: true });
createHonoEndpoints(
  validateResponseContact,
  s.router(validateResponseContact, {
    testPathParams: async ({ params, query }, env) => {
      console.log(env.MY_KV_NAMESPACE.doot === 'dang' ? 'yay' : 'nay');
      return {
        status: 200,
        body: {
          ...params,
          ...query,
        },
      };
    },
  }),
  app,
  { responseValidation: true }
);

export const errorLoggerMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    if (c.error instanceof ResponseValidationError) {
      console.error(c.error.cause);
    }
    await next();
  };
};

app.use('*', errorLoggerMiddleware());
app.showRoutes();

export default app;
