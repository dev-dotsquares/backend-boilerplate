import swaggerJsdoc from 'swagger-jsdoc';
import { config } from '@/config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Enterprise Backend API',
      version: '1.0.0',
      description:
        'Production-ready REST API with clean architecture and database provider switching',
    },
    servers: [
      {
        url: `http://localhost:${config.app.port}/api`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateUser: {
          type: 'object',
          required: ['email', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            name: { type: 'string', minLength: 1, maxLength: 100 },
          },
        },
        UpdateUser: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {},
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: {},
            meta: {
              type: 'object',
              properties: {
                requestId: { type: 'string' },
              },
            },
          },
        },
      },
    },
    paths: {
      '/v1/users': {
        post: {
          tags: ['Users'],
          summary: 'Create a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateUser' },
              },
            },
          },
          responses: {
            '201': {
              description: 'User created',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } },
              },
            },
            '409': { description: 'User with email already exists' },
            '422': { description: 'Validation error' },
          },
        },
        get: {
          tags: ['Users'],
          summary: 'List users with pagination',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 10, maximum: 100 },
            },
          ],
          responses: {
            '200': {
              description: 'Paginated user list',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } },
              },
            },
          },
        },
      },
      '/v1/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get user by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'User found' },
            '404': { description: 'User not found' },
          },
        },
        patch: {
          tags: ['Users'],
          summary: 'Update user name',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateUser' },
              },
            },
          },
          responses: {
            '200': { description: 'User updated' },
            '404': { description: 'User not found' },
          },
        },
        delete: {
          tags: ['Users'],
          summary: 'Delete user',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'User deleted' },
            '404': { description: 'User not found' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
