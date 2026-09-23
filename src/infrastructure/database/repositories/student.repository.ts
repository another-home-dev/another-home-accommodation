import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IStudentRepository } from '../../../domain/ports/student.repository.interface';
import { Student } from '../../../domain/entities/Student';
import { StudentOrmEntity } from '../entities/student.orm-entity';
import { StudentMapper } from '../mappers/student.mapper';

@Injectable()
export class StudentRepository implements IStudentRepository {
    constructor(
        @InjectRepository(StudentOrmEntity)
        private readonly typeOrmRepository: Repository<StudentOrmEntity>,
    ) { }

    async save(student: Student): Promise<Student> {
        const ormEntity = StudentMapper.toPersistence(student);
        const savedEntity = await this.typeOrmRepository.save(ormEntity);
        return StudentMapper.toDomain(savedEntity);
    }

    async findById(id: string): Promise<Student | null> {
        const ormEntity = await this.typeOrmRepository.findOne({ where: { id } });
        if (!ormEntity) return null;
        return StudentMapper.toDomain(ormEntity);
    }

    async findAll(): Promise<Student[]> {
        const ormEntities = await this.typeOrmRepository.find();
        return ormEntities.map((entity) => StudentMapper.toDomain(entity));
    }

    async findByAsgardeoSub(asgardeoSub: string): Promise<Student | null> {
        const ormEntity = await this.typeOrmRepository.findOne({ where: { asgardeoSub } });
        if (!ormEntity) return null;
        return StudentMapper.toDomain(ormEntity);
    }

    async findByEmail(email: string): Promise<Student | null> {
        const ormEntity = await this.typeOrmRepository.findOne({ where: { email } });
        if (!ormEntity) return null;
        return StudentMapper.toDomain(ormEntity);
    }
}
