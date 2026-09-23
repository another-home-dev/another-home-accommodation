import { Student } from '../entities/Student';

export const STUDENT_REPOSITORY = Symbol('STUDENT_REPOSITORY');

export interface IStudentRepository {
    save(student: Student): Promise<Student>;
    findById(id: string): Promise<Student | null>;
    findAll(): Promise<Student[]>;
    findByAsgardeoSub(asgardeoSub: string): Promise<Student | null>;
    findByEmail(email: string): Promise<Student | null>;
}
