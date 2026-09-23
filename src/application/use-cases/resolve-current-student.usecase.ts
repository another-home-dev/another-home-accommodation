import { Injectable, Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { STUDENT_REPOSITORY } from '../../domain/ports/student.repository.interface';
import type { IStudentRepository } from '../../domain/ports/student.repository.interface';
import { BED_REPOSITORY } from '../../domain/ports/bed.repository.interface';
import type { IBedRepository } from '../../domain/ports/bed.repository.interface';
import { ROOM_REPOSITORY } from '../../domain/ports/room.repository.interface';
import type { IRoomRepository } from '../../domain/ports/room.repository.interface';
import { BUILDING_REPOSITORY } from '../../domain/ports/building.repository.interface';
import type { IBuildingRepository } from '../../domain/ports/building.repository.interface';
import { Student } from '../../domain/entities/Student';

/** The caller's identity, as injected by the gateway from the verified access token. */
export interface CallerIdentity {
    asgardeoSub: string;
    email?: string;
    name?: string;
}

/**
 * Resolves the Asgardeo-authenticated caller to their backend Student record.
 *
 * A student's record can come from two places:
 *  - A warden creates it (POST /accommodation/students) with the student's email
 *    before they ever log in. On first login we link the two by matching email,
 *    then cache the `sub` so later logins resolve directly.
 *  - The student self-registers on the Asgardeo login page, so no record exists.
 *    We create one on their first login, which is what makes them show up in the
 *    warden's student list so a room can be assigned.
 */
@Injectable()
export class ResolveCurrentStudentUseCase {
    constructor(
        @Inject(STUDENT_REPOSITORY)
        private readonly studentRepository: IStudentRepository,
        @Inject(BED_REPOSITORY)
        private readonly bedRepository: IBedRepository,
        @Inject(ROOM_REPOSITORY)
        private readonly roomRepository: IRoomRepository,
        @Inject(BUILDING_REPOSITORY)
        private readonly buildingRepository: IBuildingRepository,
    ) { }

    async execute(caller: CallerIdentity) {
        const student = await this.findOrProvision(caller);
        return this.withRoom(student);
    }

    async findOrProvision({ asgardeoSub, email, name }: CallerIdentity): Promise<Student> {
        // TypeORM treats an undefined `where` value as "no condition" and would return
        // the first student in the table, so never look up without a sub.
        if (!asgardeoSub) {
            throw new UnauthorizedException('Missing caller identity.');
        }

        const bySub = await this.studentRepository.findByAsgardeoSub(asgardeoSub);
        if (bySub) return bySub;

        if (!email) {
            throw new NotFoundException(
                'No student record found, and no email was received to create one. ' +
                    "Check that the Asgardeo app includes the email attribute in its access token.",
            );
        }

        const byEmail = await this.studentRepository.findByEmail(email);
        if (byEmail) {
            byEmail.asgardeoSub = asgardeoSub;
            return this.studentRepository.save(byEmail);
        }

        const selfRegistered = new Student(
            randomUUID(),
            // Wardens can replace this with the university's student code later.
            `SR-${randomUUID().slice(0, 8).toUpperCase()}`,
            name?.trim() || email.split('@')[0],
            email,
            '',
            null,
            null,
            null,
            undefined,
            asgardeoSub,
        );
        return this.studentRepository.save(selfRegistered);
    }

    async withRoom(student: Student) {
        const occupiedBeds = await this.bedRepository.findOccupiedBeds();
        const bed = occupiedBeds.find((b) => b.studentId === student.id);
        const room = bed ? await this.roomRepository.findById(bed.roomId) : null;
        const building = room?.buildingId ? await this.buildingRepository.findById(room.buildingId) : null;

        return {
            ...student,
            roomNumber: room?.roomNumber ?? null,
            buildingName: building?.name ?? null,
        };
    }
}
