import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { STUDENT_REPOSITORY } from '../../domain/ports/student.repository.interface';
import type { IStudentRepository } from '../../domain/ports/student.repository.interface';
import { Student } from '../../domain/entities/Student';

/**
 * Resolves the Asgardeo-authenticated caller to their backend Student record.
 *
 * Students are created by a warden (POST /accommodation/students) using the
 * student's university email, before that student ever logs into the mobile
 * app — so there's no Asgardeo `sub` on file yet at that point. On first login
 * we link the two by matching email, then cache the `sub` on the record so
 * every later login resolves directly without an email lookup.
 */
@Injectable()
export class ResolveCurrentStudentUseCase {
    constructor(
        @Inject(STUDENT_REPOSITORY)
        private readonly studentRepository: IStudentRepository,
    ) { }

    async execute(asgardeoSub: string, email: string | undefined): Promise<Student> {
        const bySub = await this.studentRepository.findByAsgardeoSub(asgardeoSub);
        if (bySub) return bySub;

        if (email) {
            const byEmail = await this.studentRepository.findByEmail(email);
            if (byEmail) {
                byEmail.asgardeoSub = asgardeoSub;
                return this.studentRepository.save(byEmail);
            }
        }

        throw new NotFoundException(
            'No student record found for this account yet. Ask your hostel warden to register you before logging in.',
        );
    }
}
