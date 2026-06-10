import {IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional} from 'class-validator'
import {Role} from '@prisma/client'

export class CreateUserDto{

    @IsString()
    @IsNotEmpty({message: 'Name is required'})
    fullName!: string;

    @IsEmail({}, {message: 'Invalid email address'})
    @IsNotEmpty({message: 'Email is required'})
    email!: string;

    @IsString()
    @IsNotEmpty({message: 'Password is required'})
    @MinLength(6, {message: 'Password must be at least 6 characters long'})
    password!: string;

    @IsEnum(Role, {message: 'Role must be either USER or ADMIN'})
    @IsOptional()
    role?: Role;


}