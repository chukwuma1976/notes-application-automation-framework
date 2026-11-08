// Requires ajv-formats for the "email" format:
//   import addFormats from 'ajv-formats'; addFormats(ajv);

const baseEnvelope = {
  success: { type: 'boolean' },
  status: { type: 'integer' },
  message: { type: 'string' },
};

/** GET /users/profile */
export const userProfileSchema = {
  type: 'object',
  properties: {
    ...baseEnvelope,
    data: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        company: { type: 'string' },
      },
      required: ['id', 'name', 'email'],
    },
  },
  required: ['success', 'status', 'message', 'data'],
};

/** POST /users/register */
export const userRegisterSchema = {
  type: 'object',
  properties: {
    ...baseEnvelope,
    data: {
      type: 'object',
      properties: {
        id: { type: ['string'] },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
      },
      required: ['id', 'name', 'email'],
    },
  },
  required: ['success', 'status', 'message', 'data'],
};