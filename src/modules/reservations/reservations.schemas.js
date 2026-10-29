const { z } = require('zod');

// Model danych zgodny z tabelą reservations:
// room_id, title, start_time, end_time, status oraz znaczniki czasu.
const createReservationSchema = z.object({
  body: z.object({
    roomId: z.number().int().positive(),
    title: z.string().trim().min(3).max(200),
    startTime: z.string().datetime({ offset: true }),
    endTime: z.string().datetime({ offset: true })
  }).strict()
});

const getReservationsSchema = z.object({
  query: z.object({
    roomId: z.coerce.number().int().positive().optional(),
    buildingId: z.coerce.number().int().positive().optional(),

    status: z.enum(['CONFIRMED', 'CANCELLED']).optional(),

    from: z.string().datetime({ offset: true }).optional(),
    to: z.string().datetime({ offset: true }).optional(),

    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),

    sort: z.enum([
      'startTime',
      '-startTime',
      'createdAt',
      '-createdAt',
      'participants',
      '-participants',
    ]).default('startTime'),
  }).strict().refine(
    (query) => !query.from || !query.to ||
      new Date(query.from) < new Date(query.to),
    {
      message: 'from musi być wcześniejsze niż to',
      path: ['to'],
    }
  ),
});

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
