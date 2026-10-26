const { z } = require('zod');

const createRoomSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Nazwa sali jest wymagana"),
    capacity: z.number().int().positive("Pojemność musi być większa od 0"),
    buildingId: z.number().int().positive("ID budynku jest wymagane")
  })
});

const getRoomsSchema = z.object({
  query: z.object({}).optional()
});

const roomIdParamSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val), {
      message: "ID musi być liczbą"
    })
  })
});

module.exports = {
  createRoomSchema,
  getRoomsSchema,
  roomIdParamSchema
};