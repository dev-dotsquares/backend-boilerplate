import dotenv from 'dotenv';

dotenv.config({ path: '.env.example' });

process.env['NODE_ENV'] = 'test';
process.env['DATABASE_USE'] = 'mysql';
process.env['DATABASE_URL'] = 'mysql://root@localhost:3306/test_db';
process.env['LOG_LEVEL'] = 'silent';
process.env['SWAGGER_ENABLED'] = 'false';
process.env['RATE_LIMIT_MAX'] = '1000';
process.env['JWT_SECRET'] = 'test-jwt-secret-key-at-least-16-chars';
process.env['JWT_REFRESH_SECRET'] = 'test-jwt-refresh-secret-at-least-16';
