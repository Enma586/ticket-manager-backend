import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class LoginDto {
    @IsEmail({}, { message: 'Email must have valid format' })
    @IsNotEmpty({ message: 'Email is obligatory' })
    email!: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is obligatory' })
    @MinLength(6, { message: 'Password must have 6 characters' })
    password!: string;
}