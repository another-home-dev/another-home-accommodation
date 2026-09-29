import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomOrmEntity } from './infrastructure/database/entities/room.orm-entity';
import { BedOrmEntity } from './infrastructure/database/entities/bed.orm-entity';
import { BuildingOrmEntity } from './infrastructure/database/entities/building.orm-entity';
import { StudentOrmEntity } from './infrastructure/database/entities/student.orm-entity';
import { AccommodationModule } from './accommodation.module';
import { HealthController } from './health.controller';

@Module({
    imports: [
        // Configure the global database connection
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.DB_HOST ?? '127.0.0.1',
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3308,
            username: process.env.DB_USERNAME ?? 'root',
            password: process.env.DB_PASSWORD ?? 'ishakya0809',
            database: process.env.DB_DATABASE ?? 'another_home_accommodation',
            entities: [RoomOrmEntity, BedOrmEntity, BuildingOrmEntity, StudentOrmEntity], // Add any new ORM entities here
            synchronize: true,         // MAGIC: Automatically builds the SQL tables for you based on the entities (Keep this true for dev, false for prod)
            // Default mysql2 pool is 10; raised to handle bursts of concurrent
            // students (e.g. everyone opening the app around the same time).
            // 4 services share one MySQL instance (max_connections: 151
            // default), so 25 each (100 total) leaves headroom for the rest.
            extra: { connectionLimit: 25 },
        }),
        AccommodationModule,
    ],
    controllers: [HealthController],
})
export class AppModule { }