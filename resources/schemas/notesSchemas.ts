// Requires ajv-formats for the "date-time" format:
// import addFormats from 'ajv-formats'; addFormats(ajv);

const baseEnvelope = {
    success: { type: 'boolean' },
    status: { type: 'integer' },
    message: { type: 'string' },
};

/** A single note object, reused by the schemas below. */
export const noteObjectSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string', enum: ['Home', 'Work', 'Personal'] },
        completed: { type: 'boolean' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        user_id: { type: 'string' },
    },
    required: [
        'id',
        'title',
        'description',
        'category',
        'completed',
        'created_at',
        'updated_at',
        'user_id',
    ],
};

/** GET /notes */
export const notesListSchema = {
    type: 'object',
    properties: {
        ...baseEnvelope,
        data: {
            type: 'array',
            items: noteObjectSchema,
        },
    },
    required: ['success', 'status', 'message', 'data'],
};

/** POST /notes */
export const createNoteSchema = {
    type: 'object',
    properties: {
        ...baseEnvelope,
        data: noteObjectSchema,
    },
    required: ['success', 'status', 'message', 'data'],
};

/** GET /notes/{id} */
export const getNoteByIdSchema = {
    type: 'object',
    properties: {
        ...baseEnvelope,
        data: noteObjectSchema,
    },
    required: ['success', 'status', 'message', 'data'],
};