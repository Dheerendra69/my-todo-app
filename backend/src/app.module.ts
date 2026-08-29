import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';

import { User } from './entities/user.entity';
import { Project } from './entities/project.entity';
import { Task } from './entities/task.entity';
import { Comment } from './entities/comment.entity';
import { Label } from './entities/label.entity';

import { AppController } from './app.controller';

import { AppService } from './app.service';
import { CollaborationModule } from './collaboration/collaboration.module';

const isProduction = process.env.NODE_ENV === 'deployment';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',

      ...(isProduction
        ? {
            url: process.env.DATABASE_URL,
            ssl: {
              rejectUnauthorized: false,
            },
          }
        : {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
          }),

      entities: [User, Project, Task, Comment, Label],

      synchronize: true,
    }),

    UsersModule,
    ProjectsModule,
    TasksModule,
    AuthModule,
    CommentsModule,
    CollaborationModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
