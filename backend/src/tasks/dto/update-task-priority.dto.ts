import { IsEnum } from 'class-validator';
import { TaskPriority } from '../../entities/task.entity';

export class UpdateTaskPriorityDto {
  @IsEnum(TaskPriority)
  priority: TaskPriority;
}