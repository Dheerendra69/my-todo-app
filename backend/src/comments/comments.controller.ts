import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { CommentsService } from './comments.service';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';

@Controller('tasks/:taskId/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(
    @Param('taskId') taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentsService.create(taskId, req.user.sub, createCommentDto);
  }

  @Get()
  findAll(
    @Param('taskId')
    taskId: string,
  ) {
    return this.commentsService.findAllByTask(taskId);
  }

  @Patch(':commentId')
  update(
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentsService.update(
      taskId,
      commentId,
      req.user.sub,
      updateCommentDto,
    );
  }

  @Delete(':commentId')
  remove(
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentsService.remove(taskId, commentId, req.user.sub);
  }
}
