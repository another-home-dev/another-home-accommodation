import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

/**
 * Fields a student may edit on their own record. Email is their Asgardeo login
 * identity and the student code is assigned by the warden, so neither is here.
 * Max lengths match the column sizes in StudentOrmEntity.
 */
export class UpdateCurrentStudentDto {
    @ApiProperty({ required: false, example: 'Ishara Perera' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name?: string;

    @ApiProperty({ required: false, example: '+94 71 234 5678' })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    contact?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    guardianName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    guardianContact?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    address?: string;

    @ApiProperty({ required: false, example: 'Engineering' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    faculty?: string;

    @ApiProperty({ required: false, example: 'BSc (Hons) Computer Science' })
    @IsOptional()
    @IsString()
    @MaxLength(150)
    degreeProgram?: string;

    @ApiProperty({ required: false, example: '3rd Year' })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    academicYear?: string;

    @ApiProperty({ required: false, example: '200012345678' })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    nic?: string;
}
