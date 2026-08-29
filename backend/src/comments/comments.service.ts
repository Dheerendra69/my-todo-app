import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { Comment } from '../entities/comment.entity';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CollaborationGateway } from 'src/collaboration/collaboration.gateway';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly collaborationGateway: CollaborationGateway,
  ) {}

  async create(
    taskId: string,
    userId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const author = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!author) {
      throw new NotFoundException('User not found');
    }

    let parentComment: Comment | null = null;

    if (createCommentDto.parentCommentId) {
      parentComment = await this.commentRepository.findOne({
        where: {
          id: createCommentDto.parentCommentId,
        },
        relations: {
          task: true,
        },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parentComment.task.id !== taskId) {
        throw new ForbiddenException(
          'You cannot reply to a comment from another task',
        );
      }
    }

    const comment = this.commentRepository.create({
      content: createCommentDto.content.trim(),
      task,
      author,
      parentComment,
    });

    const savedComment = await this.commentRepository.save(comment);

    const createdComment = await this.commentRepository.findOne({
      where: {
        id: savedComment.id,
      },
      relations: {
        author: true,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    });

    if (parentComment) {
      this.collaborationGateway.emitToTask(taskId, 'reply.created', {
        commentId: parentComment.id,
        reply: createdComment,
      });
    } else {
      this.collaborationGateway.emitToTask(
        taskId,
        'comment.created',
        createdComment,
      );
    }

    return createdComment;
  }

  async findAllByTask(taskId: string) {
    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.commentRepository.find({
      where: {
        task: {
          id: taskId,
        },
        parentComment: IsNull(),
      },
      relations: {
        author: true,
        replies: {
          author: true,
        },
      },
      order: {
        createdAt: 'ASC',
        replies: {
          createdAt: 'ASC',
        },
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,

        author: {
          id: true,
          name: true,
          avatar: true,
        },

        replies: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,

          author: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async update(
    taskId: string,
    commentId: string,
    userId: string,
    updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
        task: {
          id: taskId,
        },
      },
      relations: {
        author: true,
        task: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.id !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.content = updateCommentDto.content.trim();

    await this.commentRepository.save(comment);

    return comment;
  }

  async remove(taskId: string, commentId: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
        task: {
          id: taskId,
        },
      },
      relations: {
        author: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.id !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepository.remove(comment);

    return {
      message: 'Comment deleted successfully',
    };
  }
}
