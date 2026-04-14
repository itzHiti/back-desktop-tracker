import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ActivityChunk } from '../activitychunk/entities/activitychunk.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [ActivityChunk],
  migrations: ['src/database/migrations/*{.ts,.js}'],
});
