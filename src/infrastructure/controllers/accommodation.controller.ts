import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CreateRoomDto } from '../dto/create-room.dto';
import { UpdateRoomDto } from '../dto/update-room.dto';
import { AssignRoomDto } from '../dto/assign-room.dto';
import { AllocateBedDto } from '../dto/allocate-bed.dto';
import { CreateBedDto } from '../dto/create-bed.dto';
import { CreateBuildingDto } from '../dto/create-building.dto';
import { CreateStudentDto } from '../dto/create-student.dto';
import { CreateRoomUseCase } from '../../application/use-cases/create-room.usecase';
import { GetAllRoomsUseCase } from '../../application/use-cases/get-all-rooms.usecase';
import { UpdateRoomUseCase } from '../../application/use-cases/update-room.usecase';
import { DeleteRoomUseCase } from '../../application/use-cases/delete-room.usecase';
import { AllocateBedUseCase } from '../../application/use-cases/allocate-bed.usecase';
import { GetAllAllocationsUseCase } from '../../application/use-cases/get-all-allocations.usecase';
import { CreateBedUseCase } from '../../application/use-cases/create-bed.usecase';
import { CreateBuildingUseCase } from '../../application/use-cases/create-building.usecase';
import { GetAllBuildingsUseCase } from '../../application/use-cases/get-all-buildings.usecase';
import { CreateStudentUseCase } from '../../application/use-cases/create-student.usecase';
import { GetAllStudentsUseCase } from '../../application/use-cases/get-all-students.usecase';
import { AssignStudentToRoomUseCase } from '../../application/use-cases/assign-student-to-room.usecase';
import { RolesGuard, Roles } from '../guards/roles.guard';

@ApiTags('Accommodation')
@ApiBearerAuth()
// Dev/testing only: in production this header is injected by the gateway after verifying
// the Asgardeo JWT. Swagger talks to this service directly, bypassing the gateway, so this
// header lets you simulate a role here (e.g. "warden" or "super-admin") for manual testing.
@ApiHeader({ name: 'x-user-roles', description: 'Dev/testing only — comma-separated roles, normally injected by the gateway', required: false })
@UseGuards(RolesGuard)
@Controller('accommodation')
export class AccommodationController {

    constructor(
        private readonly createRoomUseCase: CreateRoomUseCase,
        private readonly getAllRoomsUseCase: GetAllRoomsUseCase,
        private readonly updateRoomUseCase: UpdateRoomUseCase,
        private readonly deleteRoomUseCase: DeleteRoomUseCase,
        private readonly allocateBedUseCase: AllocateBedUseCase,
        private readonly getAllAllocationsUseCase: GetAllAllocationsUseCase,
        private readonly createBedUseCase: CreateBedUseCase,
        private readonly createBuildingUseCase: CreateBuildingUseCase,
        private readonly getAllBuildingsUseCase: GetAllBuildingsUseCase,
        private readonly createStudentUseCase: CreateStudentUseCase,
        private readonly getAllStudentsUseCase: GetAllStudentsUseCase,
        private readonly assignStudentToRoomUseCase: AssignStudentToRoomUseCase,
    ) { }

    @Post('rooms')
    @Roles('staff', 'warden', 'super-admin')
    @ApiOperation({ summary: 'Create a new hostel room' })
    @ApiResponse({ status: 201, description: 'Room created successfully.' })
    async createRoom(@Body() createRoomDto: CreateRoomDto) {
        const room = await this.createRoomUseCase.execute(createRoomDto);
        return {
            message: 'Room created successfully.',
            data: room,
        };
    }

    @Get('rooms')
    @ApiOperation({ summary: 'Get all rooms and their current capacity' })
    @ApiResponse({ status: 200, description: 'Returns an array of all rooms.' })
    async getAllRooms() {
        const rooms = await this.getAllRoomsUseCase.execute();
        return {
            message: 'Returning all rooms from database successfully.',
            data: rooms
        };
    }

    @Post('beds')
    @Roles('staff', 'warden', 'super-admin')
    @ApiOperation({ summary: 'Create a new bed in a room' })
    @ApiResponse({ status: 201, description: 'Bed created successfully.' })
    async createBed(@Body() createBedDto: CreateBedDto) {
        const bed = await this.createBedUseCase.execute(createBedDto);
        return {
            message: 'Bed created successfully.',
            data: bed,
        };
    }

    @Post('allocations')
    @Roles('staff', 'warden', 'super-admin')
    @ApiOperation({ summary: 'Assign a student to a specific bed' })
    @ApiResponse({ status: 201, description: 'Student successfully allocated.' })
    @ApiResponse({ status: 400, description: 'Bed already occupied or not found.' })
    async allocateStudent(@Body() allocateBedDto: AllocateBedDto) {
        const allocation = await this.allocateBedUseCase.execute(allocateBedDto);
        return {
            message: 'Student allocated to bed successfully.',
            data: allocation,
        };
    }

    @Get('allocations')
    @ApiOperation({ summary: 'Get a list of all current bed allocations' })
    @ApiResponse({ status: 200, description: 'Returns all occupied beds.' })
    async getAllAllocations() {
        const allocations = await this.getAllAllocationsUseCase.execute();
        return {
            message: 'Successfully retrieved all allocations.',
            data: allocations
        };
    }

    @Patch('rooms/:id')
    @Roles('staff', 'warden', 'super-admin')
    @ApiOperation({ summary: 'Update an existing hostel room' })
    async updateRoom(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
        const room = await this.updateRoomUseCase.execute(id, updateRoomDto);
        return {
            message: 'Room updated successfully.',
            data: room,
        };
    }

    @Delete('rooms/:id')
    @Roles('staff', 'warden', 'super-admin')
    @ApiOperation({ summary: 'Delete a hostel room' })
    async deleteRoom(@Param('id') id: string) {
        await this.deleteRoomUseCase.execute(id);
        return {
            message: 'Room deleted successfully.',
        };
    }

    @Post('rooms/:id/assign')
    @Roles('staff', 'warden', 'super-admin')
    @ApiOperation({ summary: 'Assign a student to the next available bed in a room' })
    async assignStudentToRoom(@Param('id') id: string, @Body() assignRoomDto: AssignRoomDto) {
        const allocation = await this.assignStudentToRoomUseCase.execute(id, assignRoomDto.studentId);
        return {
            message: 'Student assigned to room successfully.',
            data: allocation,
        };
    }

    @Post('buildings')
    @Roles('staff', 'warden', 'super-admin')
    @ApiOperation({ summary: 'Create a new hostel building' })
    async createBuilding(@Body() createBuildingDto: CreateBuildingDto) {
        const building = await this.createBuildingUseCase.execute(createBuildingDto);
        return {
            message: 'Building created successfully.',
            data: building,
        };
    }

    @Get('buildings')
    @ApiOperation({ summary: 'Get all buildings with occupancy summary' })
    async getAllBuildings() {
        const buildings = await this.getAllBuildingsUseCase.execute();
        return {
            message: 'Returning all buildings successfully.',
            data: buildings,
        };
    }

    @Post('students')
    @Roles('staff', 'warden', 'super-admin')
    @ApiOperation({ summary: 'Register a new student' })
    async createStudent(@Body() createStudentDto: CreateStudentDto) {
        const student = await this.createStudentUseCase.execute(createStudentDto);
        return {
            message: 'Student created successfully.',
            data: student,
        };
    }

    @Get('students')
    @ApiOperation({ summary: 'Get all students with their current room assignment' })
    async getAllStudents() {
        const students = await this.getAllStudentsUseCase.execute();
        return {
            message: 'Returning all students successfully.',
            data: students,
        };
    }
}