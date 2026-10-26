const { z } = require('zod');

const createBuildingSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Nazwa budynku musi mieć co najmniej 2 znaki"),
    address: z.string().min(5, "Adres musi mieć co najmniej 5 znaków"),
  }),
});

const getBuildingByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID musi być liczbą").transform(Number),
  }),
});

module.exports = {
  createBuildingSchema,
  getBuildingByIdSchema,
};