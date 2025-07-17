import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

// necessary configuration
export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST') || "database-1.cxoos2mao5q1.ap-south-1.rds.amazonaws.com",
  port: parseInt(configService.get<string>('DB_PORT')!, 10) || 5432,
  username: configService.get<string>('DB_USERNAME') || "sharathm",
  password: configService.get<string>('DB_PASSWORD') || "0bvlylvBhhPecaURsh1n",
  database: configService.get<string>('DB_NAME') || "master_db",
  ssl: {
    rejectUnauthorized: false,
  },

  // Automatically load all entity files
  autoLoadEntities: true,

  // If you're using synchronize: false (recommended for production), run migrations:
  // npx typeorm migration:run
  synchronize: true,

  // Enable query logging in dev only (remove or conditionally control in prod)
  logging: true,
});
