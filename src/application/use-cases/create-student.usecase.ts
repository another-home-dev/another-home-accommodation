import { Injectable, Inject } from '@nestjs/common';
import { STUDENT_REPOSITORY } from '../../domain/ports/student.repository.interface';
import type { IStudentRepository } from '../../domain/ports/student.repository.interface';
import { Student } from '../../domain/entities/Student';
import { CreateStudentDto } from '../../infrastructure/dto/create-student.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateStudentUseCase {
    constructor(
        @Inject(STUDENT_REPOSITORY)
        private readonly studentRepository: IStudentRepository,
    ) { }

    async execute(dto: CreateStudentDto): Promise<Student> {
        const newStudent = new Student(
            randomUUID(),
            dto.studentCode,
            dto.name,
            dto.email,
            dto.contact,
            dto.guardianName ?? null,
            dto.guardianContact ?? null,
            dto.address ?? null,
            undefined,
            null,
            dto.faculty ?? null,
            dto.degreeProgram ?? null,
            dto.academicYear ?? null,
            dto.nic ?? null,
        );
        return await this.studentRepository.save(newStudent);
    }
}
