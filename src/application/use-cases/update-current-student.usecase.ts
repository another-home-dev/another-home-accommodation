import { Injectable, Inject } from '@nestjs/common';
import { STUDENT_REPOSITORY } from '../../domain/ports/student.repository.interface';
import type { IStudentRepository } from '../../domain/ports/student.repository.interface';
import { UpdateCurrentStudentDto } from '../../infrastructure/dto/update-current-student.dto';
import { ResolveCurrentStudentUseCase, CallerIdentity } from './resolve-current-student.usecase';

/** Lets a logged-in student edit their own profile fields. */
@Injectable()
export class UpdateCurrentStudentUseCase {
    constructor(
        @Inject(STUDENT_REPOSITORY)
        private readonly studentRepository: IStudentRepository,
        private readonly resolveCurrentStudent: ResolveCurrentStudentUseCase,
    ) { }

    async execute(caller: CallerIdentity, dto: UpdateCurrentStudentDto) {
        const student = await this.resolveCurrentStudent.findOrProvision(caller);

        // Optional text fields: an empty string clears the value.
        const clearable = ['guardianName', 'guardianContact', 'address', 'faculty', 'degreeProgram', 'academicYear', 'nic'] as const;
        for (const field of clearable) {
            if (dto[field] !== undefined) {
                student[field] = dto[field].trim() || null;
            }
        }
        if (dto.name !== undefined) student.name = dto.name.trim();
        if (dto.contact !== undefined) student.contact = dto.contact.trim();

        const saved = await this.studentRepository.save(student);
        return this.resolveCurrentStudent.withRoom(saved);
    }
}
