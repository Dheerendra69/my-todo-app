import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';

import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', process.env.FRONTEND_URL],
    credentials: true,
  },
})
export class CollaborationGateway {
  @WebSocketServer()
  server: Server | undefined;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        socket.disconnect();
        return;
      }

      const payload = this.jwtService.verify<{
        sub: string;
        email?: string;
        isGuest: boolean;
      }>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      socket.data.user = payload;
    } catch {
      socket.disconnect();
    }
  }

  @SubscribeMessage('join-task')
  async handleJoinTask(
    @MessageBody() taskId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;

    if (!user) {
      socket.disconnect();
      return;
    }

    const task = await this.taskRepository.findOne({
      where: {
        id: taskId,
      },
      relations: {
        members: true,
        assignee: true,
      },
    });

    if (!task) {
      return {
        event: 'join-task-error',
        message: 'Task not found',
      };
    }

    const isMember = task?.members?.some((member) => member.id === user.sub);

    const isAssignee = task.assignee?.id === user.sub;

    if (!isMember && !isAssignee) {
      return {
        event: 'join-task-error',
        message: 'You are not a member of this task',
      };
    }

    socket.join(`task:${taskId}`);

    return {
      event: 'joined-task',
      taskId,
    };
  }

  @SubscribeMessage('leave-task')
  handleLeaveTask(
    @MessageBody() taskId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.leave(`task:${taskId}`);

    return {
      event: 'left-task',
      taskId,
    };
  }

  @SubscribeMessage('task.typing.start')
  async handleTypingStart(
    @MessageBody() taskId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;

    if (!user) return;

    const dbUser = await this.userRepository.findOne({
      where: {
        id: user.sub,
      },
    });

    if (!dbUser) return;

    socket.to(`task:${taskId}`).emit('task.typing', {
      taskId,
      userId: dbUser.id,
      userName: dbUser.name,
    });
  }

  @SubscribeMessage('task.typing.stop')
  handleTypingStop(
    @MessageBody() taskId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;

    if (!user) return;

    socket.to(`task:${taskId}`).emit('task.typing.stop', {
      taskId,
      userId: user.sub,
    });
  }

  emitToTask(taskId: string, event: string, data: unknown) {
    this?.server?.to(`task:${taskId}`).emit(event, data);
  }
}
