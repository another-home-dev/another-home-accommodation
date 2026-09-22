import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('students')
export class StudentOrmEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 20, unique: true })
    studentCode: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 30 })
    contact: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    guardianName: string | null;

    @Column({ type: 'varchar', length: 30, nullable: true })
    guardianContact: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    address: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
    asgardeoSub: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    faculty: string | null;

    @Column({ type: 'varchar', length: 150, nullable: true })
    degreeProgram: string | null;

    @Column({ type: 'varchar', length: 30, nullable: true })
    academicYear: string | null;

    @Column({ type: 'varchar', length: 30, nullable: true })
    nic: string | null;

    @CreateDateColumn()
    joinedDate: Date;
}
