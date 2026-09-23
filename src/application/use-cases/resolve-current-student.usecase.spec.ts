import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ResolveCurrentStudentUseCase } from './resolve-current-student.usecase';
import { IStudentRepository } from '../../domain/ports/student.repository.interface';
import { IBedRepository } from '../../domain/ports/bed.repository.interface';
import { IRoomRepository } from '../../domain/ports/room.repository.interface';
import { IBuildingRepository } from '../../domain/ports/building.repository.interface';
import { Student } from '../../domain/entities/Student';
import { Bed } from '../../domain/entities/Bed';

describe('ResolveCurrentStudentUseCase', () => {
    let useCase: ResolveCurrentStudentUseCase;
    let students: jest.Mocked<IStudentRepository>;
    let beds: jest.Mocked<IBedRepository>;
    let rooms: jest.Mocked<IRoomRepository>;
    let buildings: jest.Mocked<IBuildingRepository>;

    beforeEach(() => {
        students = {
            findByAsgardeoSub: jest.fn().mockResolvedValue(null),
            findByEmail: jest.fn().mockResolvedValue(null),
            save: jest.fn().mockImplementation(async (s: Student) => s),
        } as unknown as jest.Mocked<IStudentRepository>;
        beds = { findOccupiedBeds: jest.fn().mockResolvedValue([]) } as unknown as jest.Mocked<IBedRepository>;
        rooms = { findById: jest.fn().mockResolvedValue(null) } as unknown as jest.Mocked<IRoomRepository>;
        buildings = { findById: jest.fn().mockResolvedValue(null) } as unknown as jest.Mocked<IBuildingRepository>;

        useCase = new ResolveCurrentStudentUseCase(students, beds, rooms, buildings);
    });

    it('returns the record already linked to the caller', async () => {
        const linked = new Student('stu-1', 'AH-1', 'Linked', 'linked@uom.lk', '071', null, null, null, undefined, 'sub-1');
        students.findByAsgardeoSub.mockResolvedValue(linked);

        const result = await useCase.execute({ asgardeoSub: 'sub-1', email: 'linked@uom.lk' });

        expect(result.id).toBe('stu-1');
        expect(students.save).not.toHaveBeenCalled();
    });

    it('links a warden-created record by email on first login', async () => {
        const created = new Student('stu-2', 'AH-2', 'Warden Made', 'made@uom.lk', '071');
        students.findByEmail.mockResolvedValue(created);

        const result = await useCase.execute({ asgardeoSub: 'sub-2', email: 'made@uom.lk' });

        expect(result.id).toBe('stu-2');
        expect(result.asgardeoSub).toBe('sub-2');
    });

    it('creates a record for a self-registered student', async () => {
        const result = await useCase.execute({ asgardeoSub: 'sub-3', email: 'new@uom.lk', name: 'New Student' });

        expect(students.save).toHaveBeenCalledTimes(1);
        expect(result.name).toBe('New Student');
        expect(result.email).toBe('new@uom.lk');
        expect(result.asgardeoSub).toBe('sub-3');
        expect(result.studentCode).toMatch(/^SR-[0-9A-F]{8}$/);
        expect(result.roomNumber).toBeNull();
    });

    it('falls back to the email name when no display name is sent', async () => {
        const result = await useCase.execute({ asgardeoSub: 'sub-4', email: 'kasun.p@uom.lk' });
        expect(result.name).toBe('kasun.p');
    });

    it('refuses to look up without a sub', async () => {
        await expect(useCase.execute({ asgardeoSub: '', email: 'x@uom.lk' })).rejects.toThrow(UnauthorizedException);
        expect(students.findByAsgardeoSub).not.toHaveBeenCalled();
    });

    it('cannot create a record without an email', async () => {
        await expect(useCase.execute({ asgardeoSub: 'sub-5' })).rejects.toThrow(NotFoundException);
        expect(students.save).not.toHaveBeenCalled();
    });

    it('includes the assigned room and building', async () => {
        students.findByAsgardeoSub.mockResolvedValue(
            new Student('stu-6', 'AH-6', 'Roomed', 'r@uom.lk', '071', null, null, null, undefined, 'sub-6'),
        );
        beds.findOccupiedBeds.mockResolvedValue([new Bed('bed-1', 'room-1', true, 'stu-6', 'B1')]);
        rooms.findById.mockResolvedValue({ roomId: 'room-1', roomNumber: '101', buildingId: 'bld-1' } as never);
        buildings.findById.mockResolvedValue({ id: 'bld-1', name: 'Block A' } as never);

        const result = await useCase.execute({ asgardeoSub: 'sub-6' });

        expect(result.roomNumber).toBe('101');
        expect(result.buildingName).toBe('Block A');
    });
});
