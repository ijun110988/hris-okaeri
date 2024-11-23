const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HRIS Okaeri API Documentation',
      version: '1.0.0',
      description: 'API documentation for HRIS Okaeri system',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Branch: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              readOnly: true,
              description: 'Branch ID',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Branch name',
              minLength: 1,
              example: "Kantor Pusat Jakarta"
            },
            code: {
              type: 'string',
              description: 'Unique branch code (auto-generated)',
              minLength: 1,
              readOnly: true,
              example: "OKE001"
            },
            address: {
              type: 'string',
              description: 'Complete branch address',
              nullable: true,
              example: "Gedung Menara Palma Lt. 5, Jl. HR Rasuna Said Kav. 6, Kuningan, Jakarta Selatan"
            },
            phoneNumber: {
              type: 'string',
              description: 'Branch contact number with area code',
              nullable: true,
              example: "021-5795-8000"
            },
            email: {
              type: 'string',
              description: 'Official branch email address',
              format: 'email',
              nullable: true,
              example: "jakarta.hq@okaeri.id"
            },
            latitude: {
              type: 'number',
              format: 'decimal',
              description: 'Branch latitude coordinate (South is negative)',
              minimum: -90,
              maximum: 90,
              example: -6.2088,
              nullable: true
            },
            longitude: {
              type: 'number',
              format: 'decimal',
              description: 'Branch longitude coordinate (West is negative)',
              minimum: -180,
              maximum: 180,
              example: 106.8456,
              nullable: true
            },
            isActive: {
              type: 'boolean',
              description: 'Branch operational status',
              default: true,
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              readOnly: true,
              description: 'Record creation timestamp',
              example: "2024-01-20T08:30:00.000Z"
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              readOnly: true,
              description: 'Last modification timestamp',
              example: "2024-01-20T08:30:00.000Z"
            }
          },
          required: ['name'],
          example: {
            name: "Kantor Pusat Jakarta",
            address: "Gedung Menara Palma Lt. 5, Jl. HR Rasuna Said Kav. 6, Kuningan, Jakarta Selatan",
            phoneNumber: "021-5795-8000",
            email: "jakarta.hq@okaeri.id",
            latitude: -6.2088,
            longitude: 106.8456,
            isActive: true
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              example: 'Error message description'
            }
          },
          example: {
            status: "error",
            message: "Branch with this email already exists"
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
