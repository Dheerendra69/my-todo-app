import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['High', 'Medium', 'Low'])
  priority?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsUUID()
  ownerId: string;
}
