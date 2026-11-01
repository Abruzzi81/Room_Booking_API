const { z } = require('zod');

const buildingBody = {
  name: z.string().trim().min(2, 'Nazwa budynku musi mieć co najmniej 2 znaki'),
  address: z.string().trim().min(5, 'Adres musi mieć co najmniej 5 znaków'),
};

const createBuildingSchema = z.object({
  body: z.object(buildingBody).strict(),
});

const updateBuildingSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'ID musi być liczbą').transform(Number) }),
  body: z.object({
    name: buildingBody.name.optional(),
    address: buildingBody.address.optional(),
  }).strict().refine((data) => Object.keys(data).length > 0, {
    message: 'Podaj przynajmniej jedno pole do aktualizacji',
  }),
});

const getBuildingByIdSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/, 'ID musi być liczbą').transform(Number) }),
});

module.exports = { createBuildingSchema, updateBuildingSchema, getBuildingByIdSchema };
