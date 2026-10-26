const { z } = require('zod');

// Schema dla POST /api/reservations
const createReservationSchema = z.object({
  body: z.object({
    roomId: z.number().int().positive(),
    reservedBy: z.string().trim().min(3).max(100),
    participants: z.number().int().positive(),
    startTime: z.string().datetime({ offset: true }), // ISO 8601 ze strefą
    endTime: z.string().datetime({ offset: true })
  }).strict() // Odrzuca nieznane pola (np. status, id)
});

// Schema dla GET /api/reservations?roomId=...
const getReservationsSchema = z.object({
  query: z.object({
    roomId: z.coerce.number().int().positive().optional()
  }).strict()
});

// Schema dla PATCH /api/reservations/:id/cancel oraz ID w parametrach URL
const reservationIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive()
  }).strict()
});

module.exports = {
  createReservationSchema,
  getReservationsSchema,
  reservationIdParamSchema
};