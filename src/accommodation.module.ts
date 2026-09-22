import { Module } from '@nestjs/common';
import { AccommodationController } from './infrastructure/controllers/accommodation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateRoomUseCase } from './application/use-cases/create-room.usecase';
import { ROOM_REPOSITORY } from './domain/ports/room.repository.interface';
import { RoomRepository } from './infrastructure/database/repositories/room.repository';
import { RoomOrmEntity } from './infrastructure/database/entities/room.orm-entity';
import { GetAllRoomsUseCase } from './application/use-cases/get-all-rooms.usecase';
import { UpdateRoomUseCase } from './application/use-cases/update-room.usecase';
import { DeleteRoomUseCase } from './application/use-cases/delete-room.usecase';
import { BedOrmEntity } from './infrastructure/database/entities/bed.orm-entity';
import { AllocateBedUseCase } from './application/use-cases/allocate-bed.usecase';
import { GetAllAllocationsUseCase } from './application/use-cases/get-all-allocations.usecase';
import { BED_REPOSITORY } from './domain/ports/bed.repository.interface';
import { BedRepository } from './infrastructure/database/repositories/bed.repository';
import { CreateBedUseCase } from './application/use-cases/create-bed.usecase';
import { BuildingOrmEntity } from './infrastructure/database/entities/building.orm-entity';
import { BUILDING_REPOSITORY } from './domain/ports/building.repository.interface';
import { BuildingRepository } from './infrastructure/database/repositories/building.repository';
import { CreateBuildingUseCase } from './application/use-cases/create-building.usecase';
import { GetAllBuildingsUseCase } from './application/use-cases/get-all-buildings.usecase';
import { StudentOrmEntity } from './infrastructure/database/entities/student.orm-entity';
import { STUDENT_REPOSITORY } from './domain/ports/student.repository.interface';
import { StudentRepository } from './infrastructure/database/repositories/student.repository';
import { CreateStudentUseCase } from './application/use-cases/create-student.usecase';
import { GetAllStudentsUseCase } from './application/use-cases/get-all-students.usecase';
import { AssignStudentToRoomUseCase } from './application/use-cases/assign-student-to-room.usecase';
import { ResolveCurrentStudentUseCase } from './application/use-cases/resolve-current-student.usecase';

@Module({
    // 1. Crucial: This tells NestJS and TypeORM to generate/manage the tables for this module
    imports: [TypeOrmModule.forFeature([RoomOrmEntity, BedOrmEntity, BuildingOrmEntity, StudentOrmEntity])],

    // 2. Registers your web API controller
    controllers: [AccommodationController],

    // 3. Registers your use-cases and binds the Interfaces to the MySQL Repositories
    providers: [
        CreateRoomUseCase,
        GetAllRoomsUseCase,
        UpdateRoomUseCase,
        DeleteRoomUseCase,
        AllocateBedUseCase,
        GetAllAllocationsUseCase,
        CreateBedUseCase,
        CreateBuildingUseCase,
        GetAllBuildingsUseCase,
        CreateStudentUseCase,
        GetAllStudentsUseCase,
        AssignStudentToRoomUseCase,
        ResolveCurrentStudentUseCase,
        {
            provide: ROOM_REPOSITORY,
            useClass: RoomRepository
        },
        {
            provide: BED_REPOSITORY,
            useClass: BedRepository
        },
        {
            provide: BUILDING_REPOSITORY,
            useClass: BuildingRepository
        },
        {
            provide: STUDENT_REPOSITORY,
            useClass: StudentRepository
        },
    ],
})
export class AccommodationModule { }
