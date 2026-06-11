import {IsOptional, IsString, IsEnum, IsBoolean} from 'class-validator'
import {Transform} from 'class-transformer'
import {Role} from '@prisma/client'
import {PaginationDto} from '../../../common/dto/pagination.dto'

export class QueryUserDto extends PaginationDto {
    
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(Role, {message: 'Role must be either USER or ADMIN'})
    role?: Role;

    @IsOptional()
    @Transform(({value}) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @IsBoolean()
    isActive?: boolean;

}