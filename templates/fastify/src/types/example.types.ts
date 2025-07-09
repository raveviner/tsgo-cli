import { FromSchema } from 'json-schema-to-ts';

export const postExampleBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
  required: ['name'],
  additionalProperties: false,
} as const;

export type PostExampleBody = FromSchema<typeof postExampleBodySchema>;

export const postExampleResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    timestamp: { type: 'string' },
  },
  required: ['message', 'timestamp'],
  additionalProperties: false,
} as const;

export type PostExampleResponse = FromSchema<typeof postExampleResponseSchema>;

export const getExampleResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
  required: ['message'],
  additionalProperties: false,
} as const;

export type GetExampleResponse = FromSchema<typeof getExampleResponseSchema>;
