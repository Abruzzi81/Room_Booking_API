
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',

    info: {
      title: 'Room Booking API',
      version: '1.0.0',
      description:
        'REST API do zarządzania budynkami, salami i rezerwacjami.',
    },

    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serwer lokalny',
      },
    ],

    tags: [
      { name: 'Auth', description: 'Rejestracja i logowanie' },
      { name: 'Buildings', description: 'Zarządzanie budynkami' },
      { name: 'Rooms', description: 'Zarządzanie salami' },
      { name: 'Reservations', description: 'Zarządzanie rezerwacjami' },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Wklej token JWT otrzymany podczas logowania.',
        },
      },

      schemas: {
        ErrorResponse: {
          type: 'object',
          required: ['error'],
          properties: {
            error: {
              type: 'object',
              required: ['code', 'message', 'details', 'requestId'],
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Validation failed' },
                details: {
                  nullable: true,
                  description: 'Szczegóły błędu walidacji lub null.',
                  example: null,
                },
                requestId: {
                  type: 'string',
                  example: '26c51d8f-19db-4a26-a88a-dc68439cae3d',
                },
              },
            },
          },
        },

        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
          },
        },

        AuthCredentials: {
          type: 'object',
          required: ['email', 'password'],
          additionalProperties: false,
          properties: {
            email: { type: 'string', format: 'email', maxLength: 255 },
            password: { type: 'string', minLength: 1, maxLength: 72 },
          },
        },

        RegisterCredentials: {
          type: 'object',
          required: ['email', 'password'],
          additionalProperties: false,
          properties: {
            email: { type: 'string', format: 'email', maxLength: 255 },
            password: { type: 'string', minLength: 10, maxLength: 72 },
          },
        },

        TokenResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            tokenType: { type: 'string', example: 'Bearer' },
            expiresIn: { type: 'string', example: '15m' },
          },
        },

        BuildingInput: {
          type: 'object',
          required: ['name', 'address'],
          additionalProperties: false,
          properties: {
            name: { type: 'string', minLength: 2, example: 'Budynek A' },
            address: { type: 'string', minLength: 5, example: 'ul. Akademicka 1, Kraków' },
          },
        },

        BuildingUpdate: {
          type: 'object',
          additionalProperties: false,
          minProperties: 1,
          properties: {
            name: { type: 'string', minLength: 2 },
            address: { type: 'string', minLength: 5 },
          },
        },

        Building: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            address: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            roomsCount: { type: 'integer' },
          },
        },

        RoomInput: {
          type: 'object',
          required: ['name', 'capacity', 'buildingId'],
          additionalProperties: false,
          properties: {
            name: { type: 'string', minLength: 1, example: 'Sala 101' },
            capacity: { type: 'integer', minimum: 1, example: 30 },
            buildingId: { type: 'integer', minimum: 1, example: 1 },
          },
        },

        RoomUpdate: {
          type: 'object',
          additionalProperties: false,
          minProperties: 1,
          properties: {
            name: { type: 'string', minLength: 1 },
            capacity: { type: 'integer', minimum: 1 },
            buildingId: { type: 'integer', minimum: 1 },
          },
        },

        Room: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            capacity: { type: 'integer' },
            building: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        ReservationInput: {
          type: 'object',
          required: ['roomId', 'title', 'startTime', 'endTime'],
          additionalProperties: false,
          properties: {
            roomId: { type: 'integer', minimum: 1, example: 1 },
            title: { type: 'string', minLength: 3, maxLength: 200 },
            startTime: {
              type: 'string',
              format: 'date-time',
              example: '2026-11-10T10:00:00+01:00',
            },
            endTime: {
              type: 'string',
              format: 'date-time',
              example: '2026-11-10T12:00:00+01:00',
            },
          },
        },

        Reservation: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            roomId: { type: 'integer' },
            title: { type: 'string' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['CONFIRMED', 'CANCELLED'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },

      responses: {
        BadRequest: {
          description: 'Błędne dane wejściowe lub nieprawidłowy JSON.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },

        Unauthorized: {
          description: 'Brak lub nieprawidłowy token JWT.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },

        Forbidden: {
          description: 'Brak wymaganych uprawnień.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },

        NotFound: {
          description: 'Nie znaleziono zasobu.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },

        Conflict: {
          description: 'Konflikt danych, np. istniejący zasób.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },

        InternalServerError: {
          description: 'Nieoczekiwany błąd serwera.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },

    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Rejestracja użytkownika',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterCredentials' },
              },
            },
          },
          responses: {
            201: {
              description: 'Użytkownik został utworzony.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            400: { $ref: '#/components/responses/BadRequest' },
            409: { $ref: '#/components/responses/Conflict' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },

      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Logowanie użytkownika',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthCredentials' },
              },
            },
          },
          responses: {
            200: {
              description: 'Logowanie zakończone powodzeniem.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/TokenResponse' },
                },
              },
            },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },

      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Pobranie danych zalogowanego użytkownika',
          responses: {
            200: {
              description: 'Dane użytkownika.',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },

      '/api/buildings': {
        get: {
          tags: ['Buildings'],
          summary: 'Lista budynków',
          responses: {
            200: { description: 'Lista budynków.' },
            401: { $ref: '#/components/responses/Unauthorized' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
        post: {
          tags: ['Buildings'],
          summary: 'Utworzenie budynku (ADMIN)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BuildingInput' },
              },
            },
          },
          responses: {
            201: { description: 'Budynek utworzony.' },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            409: { $ref: '#/components/responses/Conflict' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },

      '/api/buildings/{id}': {
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer', minimum: 1 },
        }],
        get: {
          tags: ['Buildings'],
          summary: 'Pobranie budynku',
          responses: {
            200: { description: 'Dane budynku.' },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
        patch: {
          tags: ['Buildings'],
          summary: 'Aktualizacja budynku (ADMIN)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BuildingUpdate' },
              },
            },
          },
          responses: {
            200: { description: 'Budynek zaktualizowany.' },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
        delete: {
          tags: ['Buildings'],
          summary: 'Usunięcie budynku (ADMIN)',
          responses: {
            204: { description: 'Budynek usunięty.' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            409: { $ref: '#/components/responses/Conflict' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },

      '/api/buildings/{id}/rooms': {
        get: {
          tags: ['Buildings'],
          summary: 'Lista sal w budynku',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          }],
          responses: {
            200: { description: 'Lista sal budynku.' },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },

      '/api/rooms': {
        get: {
          tags: ['Rooms'],
          summary: 'Lista sal',
          responses: {
            200: { description: 'Lista sal.' },
            401: { $ref: '#/components/responses/Unauthorized' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
        post: {
          tags: ['Rooms'],
          summary: 'Utworzenie sali (ADMIN)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RoomInput' },
              },
            },
          },
          responses: {
            201: { description: 'Sala utworzona.' },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            409: { $ref: '#/components/responses/Conflict' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },

      '/api/rooms/{id}': {
        parameters: [{
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer', minimum: 1 },
        }],
        get: {
          tags: ['Rooms'],
          summary: 'Pobranie sali',
          responses: {
            200: { description: 'Dane sali.' },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
        patch: {
          tags: ['Rooms'],
          summary: 'Aktualizacja sali (ADMIN)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RoomUpdate' },
              },
            },
          },
          responses: {
            200: { description: 'Sala zaktualizowana.' },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            409: { $ref: '#/components/responses/Conflict' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
        delete: {
          tags: ['Rooms'],
          summary: 'Usunięcie sali (ADMIN)',
          responses: {
            204: { description: 'Sala usunięta.' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: { $ref: '#/components/responses/NotFound' },
            409: { $ref: '#/components/responses/Conflict' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },

      '/api/reservations': {
        get: {
          tags: ['Reservations'],
          summary: 'Lista rezerwacji',
          parameters: [
            { name: 'roomId', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'buildingId', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'userId', in: 'query', schema: { type: 'integer', minimum: 1 } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['CONFIRMED', 'CANCELLED'] } },
            { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
            { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
            { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
            {
              name: 'sort',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['startTime', '-startTime', 'createdAt', '-createdAt', 'participants', '-participants'],
                default: 'startTime',
              },
            },
          ],
          responses: {
            200: { description: 'Lista rezerwacji wraz z metadanymi.' },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
        post: {
          tags: ['Reservations'],
          summary: 'Utworzenie rezerwacji',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReservationInput' },
              },
            },
          },
          responses: {
            201: { description: 'Rezerwacja utworzona.' },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
            409: { $ref: '#/components/responses/Conflict' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },

      '/api/reservations/{id}': {
        get: {
          tags: ['Reservations'],
          summary: 'Pobranie rezerwacji',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          }],
          responses: {
            200: { description: 'Dane rezerwacji.' },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },

      '/api/reservations/{id}/cancel': {
        patch: {
          tags: ['Reservations'],
          summary: 'Anulowanie rezerwacji',
          parameters: [{
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          }],
          responses: {
            200: { description: 'Rezerwacja anulowana.' },
            400: { $ref: '#/components/responses/BadRequest' },
            401: { $ref: '#/components/responses/Unauthorized' },
            404: { $ref: '#/components/responses/NotFound' },
            409: { $ref: '#/components/responses/Conflict' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },
    },

    security: [{ bearerAuth: [] }],
  },

  apis: [],
};

module.exports = swaggerJsdoc(options);
