import { IsOptional, IsDate} from 'class-validator'
import { Type} from 'class-transformer'

export class DateRangeDto {
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    startDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    endDate?: Date

}
 
