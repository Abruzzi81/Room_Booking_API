const { z } = require('zod');

const roomFields = {
  name: z.string().trim().min(1, 'Nazwa sali jest wymagana'),
  capacity: z.number().int().positive('Pojemność musi być większa od 0'),
  buildingId: z.number().int().positive('ID budynku musi być dodatnie'),
};

const createRoomSchema = z.object({ body: z.object(roomFields).strict() });
const updateRoomSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'ID musi być liczbą').transform(Number) }),
  body: z.object({
    name: roomFields.name.optional(),
    capacity: roomFields.capacity.optional(),
    buildingId: roomFields.buildingId.optional(),
  }).strict().refine((data) => Object.keys(data).length > 0, {
    message: 'Podaj przynajmniej jedno pole do aktualizacji',
  }),
});
const getRoomsSchema = z.object({ query: z.object({}).passthrough().optional() });
const roomIdParamSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'ID musi być liczbą').transform(Number) }),
});

module.exports = { createRoomSchema, updateRoomSchema, getRoomsSchema, roomIdParamSchema };
