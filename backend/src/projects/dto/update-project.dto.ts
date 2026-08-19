import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['High', 'Medium', 'Low'])
  priority?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;
}
