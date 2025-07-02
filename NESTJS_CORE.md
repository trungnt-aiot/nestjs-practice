## ENVIRONMENT INSTALLATION

### INSTALL NESTJS

- Use this command to install `NestJS`, `cli` is command line interface

```bash
sudo npm install -g @nestjs/cli
```

- To create new project, we follow to command:

```bash
nest new trungproject
```

- After creating project, we run the following command to start project:

```bash
npm run start:dev
```

### PROJECT STRUCTURE

#### APP MODULES

- `app.module.ts` file:

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- In this file has three important line: `imports`, `controllers` and `provider`
  - `imports` used to import other modules to this module
  - `controllers` used to navigate request, it works the same way with controller in `express`
  - `provider` used to provide service module for controller using

#### APP CONTROLLER

- `app.controller.ts` file:

```ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

- Controller module provide REST API method, app service will be injected to it

#### APP SERVICE

- `app.service.ts` file:

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

- App service used to processing business logic from controller, it handles complex jobs or validation

#### APP TESTING

- `app.controller.spec.ts` file:

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
```

- This file used to writting the unit test

### GENERATE MODULE

- `NestJS` provide some command for auto import and create module, for example:

```bash
nest generate module modules/user
```

- It will generate those files:

```bash
user.controller.spec.ts
user.controller.ts
user.module.ts
user.service.spec.ts
user.service.ts
```

- And auto import to `app.module.ts`:

```ts
@Module({
  imports: [UserModule],
  controllers: [AppController],
  providers: [AppService],
})
```

- Note: `@Injectable()` is decorator used to injecting from service to controller. Without it, we cannot using `dependency injection`

### SCOPE

NestJS provides 3 main types of `scope` to control the lifecycle of a service (provider):

- `Scope.DEFAULT` _(default)_
  - Each provider is a singleton — it is created only once and shared across the entire application.

- `Scope.TRANSIENT`
  - A new instance is created **every time the provider is injected**.

- `Scope.REQUEST`
  - A new instance is created **for each HTTP request**.

#### `Scope.DEFAULT`

```ts
import { Injectable, Scope } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly timestamp = Date.now();

  getTimestamp() {
    return this.timestamp;
  }
}
```

#### `Scope.TRANSIENT`

```ts
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class TransientService {
  private readonly createdAt = Date.now();

  getCreatedAt(): number {
    return this.createdAt;
  }
}
```

#### `Scope.TRANSIENT`

```ts
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class TransientService {
  private readonly createdAt = Date.now();

  getCreatedAt(): number {
    return this.createdAt;
  }
}
```

### HANDLING REQUEST DATA

#### @QUERY

- `@Query()` decorator used to extract query parameters from URL

```ts
import { Controller, Get, Query } from '@nestjs/common';

@Controller('users')
export class UserController {
  @Get()
  getUsers(@Query('page') page: string, @Query('limit') limit: string) {
    return `Page: ${page}, Limit: ${limit}`;
  }

  // Or get all query parameters
  @Get('search')
  searchUsers(@Query() query: any) {
    return `Search params: ${JSON.stringify(query)}`;
  }
}
```

- Example URL: `GET /users?page=1&limit=10`
- Example URL: `GET /users/search?name=john&age=25`

#### @PARAM

- `@Param()` decorator used to extract route parameters from URL path

```ts
import { Controller, Get, Param } from '@nestjs/common';

@Controller('users')
export class UserController {
  @Get(':id')
  getUserById(@Param('id') id: string) {
    return `User ID: ${id}`;
  }

  @Get(':id/posts/:postId')
  getUserPost(@Param('id') userId: string, @Param('postId') postId: string) {
    return `User ID: ${userId}, Post ID: ${postId}`;
  }

  // Or get all parameters
  @Get(':id/profile/:type')
  getUserProfile(@Param() params: any) {
    return `Params: ${JSON.stringify(params)}`;
  }
}
```

- Example URL: `GET /users/123`
- Example URL: `GET /users/123/posts/456`
- Example URL: `GET /users/123/profile/basic`

#### @BODY

- `@Body()` decorator used to extract request body data from POST, PUT, PATCH requests

```ts
import { Controller, Post, Body, Put } from '@nestjs/common';

interface CreateUserDto {
  name: string;
  email: string;
  age: number;
}

@Controller('users')
export class UserController {
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return `Creating user: ${JSON.stringify(createUserDto)}`;
  }

  @Put(':id')
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<CreateUserDto>,
  ) {
    return `Updating user ${id}: ${JSON.stringify(updateUserDto)}`;
  }

  // Get specific field from body
  @Post('login')
  login(@Body('email') email: string, @Body('password') password: string) {
    return `Login attempt: ${email}`;
  }
}
```

- Example request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 25
}
```

#### COMBINE DECORATORS

- You can combine multiple decorators in one endpoint:

```ts
import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';

@Controller('users')
export class UserController {
  @Get(':id')
  getUser(@Param('id') id: string, @Query('include') include?: string) {
    return `User ${id}, include: ${include}`;
  }

  @Post(':id/posts')
  createUserPost(
    @Param('id') userId: string,
    @Body() postData: any,
    @Query('draft') isDraft?: boolean,
  ) {
    return {
      userId,
      postData,
      isDraft: isDraft === true,
    };
  }
}
```

- Example URL: `GET /users/123?include=profile`
- Example URL: `POST /users/123/posts?draft=true`

#### VALIDATION WITH DTO

- Use DTO (Data Transfer Object) classes for better type safety and validation:

```ts
import { IsString, IsEmail, IsNumber, Min, Max } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNumber()
  @Min(18)
  @Max(100)
  age: number;
}
```

```ts
import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

@Controller('users')
export class UserController {
  @Post()
  @UsePipes(new ValidationPipe())
  createUser(@Body() createUserDto: CreateUserDto) {
    return `Creating user: ${JSON.stringify(createUserDto)}`;
  }
}
```

- Note: Remember to install `class-validator` and `class-transformer` packages for validation to work

### ENTITY

Entity is a class that maps to a database table. In NestJS with TypeORM, entities define the structure of your database tables and the relationships between them.

#### BASIC ENTITY

```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users') // Table name (optional)
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ length: 100 })
  name: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### COLUMN OPTIONS

```ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: false })
  title: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: ['draft', 'published', 'archived'] })
  status: string;

  @Column({ nullable: true })
  image?: string;
}
```

#### RELATIONSHIPS

```ts
// One-to-Many relationship
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];
}
```

```ts
// Many-to-One relationship
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => User, (user) => user.posts)
  user: User;
}
```

```ts
// Many-to-Many relationship
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];
}
```

### VALIDATION

Validation ensures that incoming data meets specific criteria before processing. NestJS uses `class-validator` and `class-transformer` for validation.

#### SETUP VALIDATION

```bash
npm install class-validator class-transformer
```

#### BASIC DTO WITH VALIDATION

```ts
import {
  IsString,
  IsEmail,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @IsNumber()
  @Min(18)
  @Max(100)
  age: number;

  @IsOptional()
  @IsString()
  bio?: string;
}
```

#### ADVANCED VALIDATION

```ts
import {
  IsString,
  IsEmail,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
  IsDateString,
  Matches,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  @Matches(/^\d{5}$/, { message: 'Zip code must be 5 digits' })
  zipCode: string;
}

export class CreateUserDto {
  @IsString()
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name can only contain letters and spaces',
  })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
    message:
      'Password must contain at least 8 characters, one uppercase, one lowercase and one number',
  })
  password: string;

  @IsEnum(UserStatus)
  status: UserStatus;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @IsDateString()
  birthDate: string;

  @IsBoolean()
  @IsOptional()
  newsletter?: boolean;
}
```

#### CUSTOM VALIDATION

```ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const strongPasswordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          return typeof value === 'string' && strongPasswordRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character';
        },
      },
    });
  };
}

// Usage
export class CreateUserDto {
  @IsStrongPassword()
  password: string;
}
```

### DTO

- Data Transfer Objects (DTOs) define the structure of data that flows between different layers of application. In NestJS, DTOs serve as contracts for API requests and responses, providing type safety and data validation.

- Take note module for example, `note-create.dto.ts` file used to verify body of request:

```ts
import { IsString, MinLength } from 'class-validator';

export class NoteCreateDto {
  @IsString()
  @MinLength(6, {
    message: 'Title cannot shorten than 6 characters',
  })
  tittle: string;

  @IsString()
  @MinLength(20, {
    message: 'content cannot shorten than 20 characters',
  })
  content: string;
}
```

- `note-update.dto.ts` file, the optional param:

```ts
import { PartialType } from '@nestjs/mapped-types';
import { NoteCreateDto } from './note-create.dto';

export class NoteUpdateDto extends PartialType(NoteCreateDto) {}
```

- `note.dto.ts` file:

```ts
import { IsString, IsUUID } from 'class-validator';
import { Note } from '../note.entity';

export class NoteDto {
  @IsUUID()
  id: string;

  @IsString()
  tittle: string;

  @IsString()
  content: string;

  @IsUUID()
  userId: string;

  @IsString()
  username: string;

  static fromEntity(note: Note): NoteDto {
    const noteDto = new NoteDto();
    noteDto.id = note.id;
    noteDto.tittle = note.tittle;
    noteDto.content = note.content;
    noteDto.userId = note.user.id;
    noteDto.username = note.user.username;

    return noteDto;
  }
}
```

### MIDDLEWARE

- Middleware is the first fire wall when client send the request to server NestJs
- We can use middleware to write history log, authentication, add infor to request, rate limitting or deny request

#### BASIC MIDDLEWARE

```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(
      `${req.method} ${req.originalUrl} - ${new Date().toISOString()}`,
    );
    next();
  }
}
```

- Apply middleware in `app.module.ts` file:

```ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AccessLogMiddleware).forRoutes('*');
  }
}
```

#### AUTHENTICATION MIDDLEWARE

```ts
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedRequest extends Request {
  user?: any;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const token = this.extractTokenFromHeader(req);

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const payload = this.jwtService.verify(token);
      req.user = payload;

      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

#### RATE LIMITTING MIDDLEWARE

```ts
import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimit {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private requests = new Map<string, RateLimit>();
  private readonly limit = 100;
  private readonly windowMs = 15 * 60 * 1000;

  use(req: Request, res: Response, next: NextFunction) {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [ip, data] of this.requests.entries()) {
      if (data.resetTime < windowStart) {
        this.requests.delete(ip);
      }
    }

    const current = this.requests.get(key);

    if (!current) {
      this.requests.set(key, { count: 1, resetTime: now + this.windowMs });
    } else if (current.resetTime > now) {
      if (current.count >= this.limit) {
        throw new HttpException(
          'Too Many Requests',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      current.count++;
    } else {
      this.requests.set(key, { count: 1, resetTime: now + this.windowMs });
    }

    const rateLimitData = this.requests.get(key);
    res.setHeader('X-RateLimit-Limit', this.limit);
    res.setHeader(
      'X-RateLimit-Remaining',
      Math.max(0, this.limit - rateLimitData.count),
    );
    res.setHeader(
      'X-RateLimit-Reset',
      new Date(rateLimitData.resetTime).toISOString(),
    );

    next();
  }
}
```

#### CORS MIDDLEWARE

```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:4200',
      'https://yourdomain.com',
    ];

    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    );

    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    next();
  }
}
```

#### TIMEOUT REQUEST MIDDLEWARE

```ts
import {
  Injectable,
  NestMiddleware,
  RequestTimeoutException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TimeoutMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const timeout = 30000; // 30 seconds

    const timer = setTimeout(() => {
      if (!res.headersSent) {
        throw new RequestTimeoutException('Request timeout');
      }
    }, timeout);

    res.on('finish', () => {
      clearTimeout(timer);
    });

    res.on('close', () => {
      clearTimeout(timer);
    });

    next();
  }
}
```

### PIPE

Pipes are used to transform and validate data. They run before the route handler method and can transform the input data or validate it.

#### BUILT-IN PIPES

```ts
import {
  Controller,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';

@Controller('users')
export class UserController {
  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return `User ID: ${id}`;
  }

  @Get()
  getUsers(
    @Query('page', ParseIntPipe) page: number,
    @Query('active', ParseBoolPipe) active: boolean,
  ) {
    return `Page: ${page}, Active: ${active}`;
  }
}
```

- In some special case, we use nested dto:

```ts
import { ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @Matches(/^\d{5}(-\d{4})?$/)
  zipCode: string;
}

class ContactDto {
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  website?: string;
}

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ValidateNested()
  @Type(() => ContactDto)
  @IsOptional()
  contact?: ContactDto;

  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
```

#### VALIDATION PIPE

```ts
import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  @Post()
  @UsePipes(new ValidationPipe())
  createUser(@Body() createUserDto: CreateUserDto) {
    return `Creating user: ${JSON.stringify(createUserDto)}`;
  }

  // Or use global validation pipe
  @Post('register')
  registerUser(@Body() createUserDto: CreateUserDto) {
    return `Registering user: ${JSON.stringify(createUserDto)}`;
  }
}
```

#### GLOBAL VALIDATION PIPE

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties not in DTO
      forbidNonWhitelisted: true, // Throw error for extra properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
```

#### CUSTOM PIPE

```ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);

    if (isNaN(val)) {
      throw new BadRequestException('Value must be a number');
    }

    if (val <= 0) {
      throw new BadRequestException('Value must be a positive number');
    }

    return val;
  }
}

// Usage
@Controller('users')
export class UserController {
  @Get(':id')
  getUserById(@Param('id', ParsePositiveIntPipe) id: number) {
    return `User ID: ${id}`;
  }
}
```

#### TRANSFORM PIPE

```ts
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (typeof value === 'object' && value !== null) {
      const trimmedObject = {};
      for (const [key, val] of Object.entries(value)) {
        trimmedObject[key] = typeof val === 'string' ? val.trim() : val;
      }
      return trimmedObject;
    }

    return value;
  }
}

// Usage
@Controller('users')
export class UserController {
  @Post()
  createUser(@Body(TrimPipe, ValidationPipe) createUserDto: CreateUserDto) {
    return `Creating user: ${JSON.stringify(createUserDto)}`;
  }
}
```

#### PIPE EXECUTION ORDER

```ts
@Controller('users')
export class UserController {
  @Post()
  createUser(
    @Body(TrimPipe, ValidationPipe) createUserDto: CreateUserDto,
    @Query('notify', ParseBoolPipe) notify: boolean,
  ) {
    // Pipes execute in order: TrimPipe -> ValidationPipe
    return `Creating user: ${JSON.stringify(createUserDto)}, Notify: ${notify}`;
  }
}
```

### CONNECT TO DB

- To connect database in NESTJS, we will use `TypeORM`, following this command:

```bash
npm install @nestjs/typeorm typeorm mysql2
```

- Config and import database to project, `app.module.ts` file:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'your_password',
      database: 'your_db_name',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- create entity class to define user table, `user.entity.ts` file:

```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 100 })
  username: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### GUARD, AUTHENTICATION AND AUTHORIZATION

- To implement authentication and authorization in NestJS, we can use `bcrypt` for password hashing and `jwt` for token-based authentication. First, install the required packages:

```bash
npm install bcrypt jsonwebtoken
npm install -D @types/bcrypt @types/jsonwebtoken
```

#### USE PASSPORT STRATEGY

- To protect routes and handle authentication, we install `passport` and `passport-jwt`:

```bash
npm install @nestjs/passport passport passport-jwt @nestjs/jwt
```

- Create a service for authentication, `jwt-auth.guard.ts` file:

```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

- To use jwt strategy, we config passport strategy, `jwt.strategy.ts` file:

```ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PayloadAuthDto } from './dto/auth-payload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  validate(payload: PayloadAuthDto) {
    return payload;
  }
}
```

- To use pasport strategy, we have to inject it into `providers`, `app.module.ts` file:

```ts
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [UserModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
```

- Use this guard to protect route in controller, use `@UseGuards(JwtAuthGuard)` decorator:

```ts
@UseGuards(JwtAuthGuard)
@Get('secret')
secret(@Req() request: Request & { user: PayloadAuthDto }) {
  console.log(request.user);
  const authHeaders: string = request.headers['authorization'] || '';
  const token = authHeaders.split(' ')[1];
  return token;
}
```

#### USE TRADITIONAL GUARD

- Implement `CanActivate` class:

```ts
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { AuthService } from './../auth.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();
    const authHeader: string | undefined = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }
    const token: string = authHeader.split(' ')[1];

    if (await this.authService.isInBlackList(token)) {
      throw new ForbiddenException('This token is in black list');
    }

    try {
      const decode = await this.authService.verifyToken(token);
      request.user = decode;
      request.accessToken = token;
      console.log(request.accessToken);
      return true;
    } catch (err) {
      console.error('Verify token failed:', err);
      throw new ForbiddenException('Invalid token');
    }
  }
}
```

- We can create custom guard to accept users, who have `Trung` in their name, `name.guard.ts` file:

```ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { PayloadAuthDto } from '../dto/auth-payload.dto';

@Injectable()
export class NameAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: AuthenticatedRequest = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const userInfor: PayloadAuthDto = request.user;
    const username: string = userInfor.username;

    if (!username.includes('Trung')) {
      throw new ForbiddenException(
        "You cannot access this site because you're not Trung",
      );
    }
    return true;
  }
}
```

- Use in controller to protect it:

```ts
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: AuthenticatedRequest): Promise<{ message: string }> {
    const refreshToken: string = req.cookies?.['refresh_token'];
    const accessToken: string = req.accessToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    if (!accessToken) {
      throw new UnauthorizedException('Missing access token');
    }

    return this.authService.logoutAccout(refreshToken, accessToken);
  }
```

#### LOGOUT - BLOCK TOKEN

- To logout account and refer access token and refresh token, we have to use blacklist and database
- We will check if those token is in blacklist, database or not
- Because `refreshToken` have a long life span so we need to store it in database if it's valid
- `refresh-token.entity.ts` file:

```ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('refresh_token')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 1000 })
  token: string;
}
```

- And to handle access token, we can use redis to create blacklist
- When user logout, current access token will be added to blacklist and will be removed
- the time access token was removed is equal to lift span of it

```ts
  async logoutAccout(
    refreshToken: string,
    accessToken: string,
  ): Promise<{ message: string }> {
    const start = Date.now();
    this.logger.log(`[logoutAccout] START ${new Date().toISOString()}`);
    try {
      await this.refreshTokenRepository.delete({ token: refreshToken });
      await this.redis.set(accessToken, 'true', 'EX', 600);
      const duration = Date.now() - start;
      this.logger.log(`[logoutAccout] SUCCESS - ${duration}ms`);
      return { message: 'logout successfully' };
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[logoutAccout] ERROR - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new InternalServerErrorException(
        'Something error! cannot delete refresh token',
      );
    }
  }
```

### QUEUE & JOB

- Queues provide a robust way to handle time-consuming tasks asynchronously. NestJS integrates with Bull queue library built on top of Redis for job processing.

#### SETUP BULL QUEUE

```bash
npm install @nestjs/bull bull
npm install @types/bull
```

#### BASIC QUEUE SETUP

```ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { NoteModule } from './modules/note/note.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';
import { RedisModule } from './modules/redis/redis.module';
import { TaskModule } from './modules/task/task.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/winston.config';
import { AccessLogMiddleware } from './logger/access-log.middleware';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({}),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3308,
      username: 'admin',
      password: 'admin',
      database: 'aiot',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    WinstonModule.forRoot(winstonConfig),
    ScheduleModule.forRoot(),
    UserModule,
    NoteModule,
    AuthModule,
    RedisModule,
    TaskModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AccessLogMiddleware).forRoutes('*');
  }
}
```

#### NOTE PROCESSOR

```ts
import { NoteCreateDto } from './dto/note-create.dto';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { User } from '../user/user.entity';
import { BadRequestException, Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Processor('note')
export class NoteProcessor extends WorkerHost {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    super();
  }

  override async process(job: Job): Promise<void> {
    const start = Date.now();

    this.logger.log(`[NoteProcessor] START job=${job.name} id=${job.id}`);

    try {
      if (job.name === 'after_create_note') {
        const {
          noteCreateDto,
          userId,
        }: { noteCreateDto: NoteCreateDto; userId: string } = job.data;

        const newNote = this.noteRepository.create(noteCreateDto);
        newNote.user = { id: userId } as User;

        const savedNote: Note = await this.noteRepository.save(newNote);

        this.logger.log(
          `[NoteProcessor] Created note ${savedNote.id} for user ${userId}`,
        );

        await new Promise((res) => setTimeout(res, 10000));

        const duration = Date.now() - start;
        this.logger.log(
          `[NoteProcessor] DONE job=${job.name} id=${savedNote.id} - ${duration}ms`,
        );
      }

      if (job.name === 'delete_note') {
        const noteId: string = job.data.noteId;

        this.logger.log(`[NoteProcessor] Deleting note ${noteId}`);

        const note: Note | null = await this.noteRepository.findOne({
          where: { id: noteId },
          relations: ['user'],
        });

        if (!note) {
          this.logger.warn(`[NoteProcessor] NOT FOUND note ${noteId}`);
          throw new BadRequestException("Note doesn't exist, cannot delete");
        }

        await new Promise((res) => setTimeout(res, 15000));

        await this.noteRepository.delete(noteId);

        const duration = Date.now() - start;
        this.logger.log(
          `[NoteProcessor] DONE delete job=${job.name} id=${noteId} - ${duration}ms`,
        );
      }
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[NoteProcessor] ERROR job=${job.name} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw err;
    }
  }
}
```

#### APPLY QUEUE JOB

```ts
  async create(
    noteCreateDto: NoteCreateDto,
    userId: string,
  ): Promise<{ message: string }> {
    const start = Date.now();
    this.logger.log(
      `[createNote] START: userId=${userId} ${new Date().toISOString()}`,
    );
    try {
      await this.noteQueue.add('after_create_note', {
        noteCreateDto,
        userId,
      });

      const duration = Date.now() - start;
      this.logger.log(`[createNote] QUEUED: userId=${userId} - ${duration}ms`);
      return { message: 'New note is creating...' };
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[createNote] ERROR - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new Error('Something error, cannot create new note');
    }
  }

  async delete(noteId: string): Promise<{ message: string }> {
    const start = Date.now();
    this.logger.log(
      `[deleteNote] START: ${noteId} ${new Date().toISOString()}`,
    );
    try {
      await this.noteQueue.add('delete_note', {
        noteId,
      });

      const duration = Date.now() - start;
      this.logger.log(`[deleteNote] QUEUED: ${noteId} - ${duration}ms`);
      return { message: 'Deleting note...' };
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[deleteNote] ERROR: ${noteId} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new Error('Something error, cannot delete this note');
    }
  }
```

#### JOB PRIORITY AND SCHEDULING

```ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class TaskService {
  constructor(
    @InjectQueue('high-priority') private highPriorityQueue: Queue,
    @InjectQueue('scheduled-tasks') private scheduledQueue: Queue,
  ) {}

  async addUrgentTask(data: any) {
    await this.highPriorityQueue.add('urgent-processing', data, {
      priority: 1,
      attempts: 5,
    });
  }

  async addNormalTask(data: any) {
    await this.highPriorityQueue.add('normal-processing', data, {
      priority: 10,
    });
  }

  async scheduleRepeatingTask(data: any) {
    await this.scheduledQueue.add('daily-report', data, {
      repeat: { cron: '0 9 * * *' },
    });
  }

  async addDelayedTask(data: any, delayInMs: number) {
    await this.scheduledQueue.add('delayed-task', data, {
      delay: delayInMs,
    });
  }

  async getJobStatus(jobId: string) {
    const job = await this.highPriorityQueue.getJob(jobId);
    return {
      id: job.id,
      name: job.name,
      progress: job.progress(),
      failedReason: job.failedReason,
      finishedOn: job.finishedOn,
    };
  }
}
```

#### BULL DASHBOARD

```ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({ name: 'email' }, { name: 'image-processing' }),
  ],
})
export class AppModule {
  constructor() {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    createBullBoard({
      queues: [
        new BullAdapter(emailQueue),
        new BullAdapter(imageProcessingQueue),
      ],
      serverAdapter,
    });
  }
}
```

#### ERROR HANDLING AND RETRIES

```ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger, HttpException } from '@nestjs/common';

@Processor('payment-processing')
export class PaymentProcessor {
  private readonly logger = new Logger(PaymentProcessor.name);

  @Process('process-payment')
  async handlePayment(job: Job) {
    const { amount, userId, paymentMethod } = job.data;

    try {
      if (amount <= 0) {
        throw new Error('Invalid amount');
      }

      await this.processPayment(amount, userId, paymentMethod);

      this.logger.log(`Payment processed successfully for user ${userId}`);
      return { success: true, transactionId: `txn_${Date.now()}` };
    } catch (error) {
      this.logger.error(`Payment failed: ${error.message}`);

      if (job.attemptsMade < job.opts.attempts) {
        throw error;
      }

      await this.handleFailedPayment(userId, amount, error.message);
      throw error;
    }
  }

  private async processPayment(amount: number, userId: string, method: string) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (Math.random() < 0.3) {
      throw new Error('Payment gateway error');
    }
  }

  private async handleFailedPayment(
    userId: string,
    amount: number,
    reason: string,
  ) {
    this.logger.warn(`Final payment failure for user ${userId}: ${reason}`);
  }
}
```

### LOGGING TO FILES

- NestJS provides comprehensive logging capabilities with Winston library for file-based logging. Logs are organized by date with separate files for access, error, and application logs.

#### SETUP WINSTON LOGGER

```bash
npm install winston winston-daily-rotate-file
npm install @types/winston
```

#### WINSTON CONFIGURATION

```ts
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const logDir = 'logs';

const getVNTime = () =>
  new Date().toLocaleString('vi-VN', {
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  });

export const winstonConfig: winston.LoggerOptions = {
  transports: [
    new DailyRotateFile({
      dirname: `${logDir}/%DATE%`,
      filename: 'app.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: getVNTime }),
        winston.format.json(),
      ),
    }),
    new DailyRotateFile({
      dirname: `${logDir}/%DATE%`,
      filename: 'error.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({ format: getVNTime }),
        winston.format.json(),
      ),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: getVNTime }),
        nestWinstonModuleUtilities.format.nestLike('App', {
          prettyPrint: true,
        }),
      ),
    }),
  ],
};
```

#### CUSTOM LOGGER SERVICE

```ts
import { Injectable, Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class CustomLoggerService implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  logAccess(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    userAgent?: string,
  ) {
    const message = `${method} ${url} ${statusCode} ${responseTime}ms ${userAgent || ''}`;
    this.logger.http(message);
  }

  logError(error: Error, context?: string, userId?: string) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      userId,
      timestamp: new Date().toISOString(),
    };

    this.logger.error('Application Error', errorInfo);
  }

  logUserAction(userId: string, action: string, details?: any) {
    const message = `User ${userId} performed action: ${action}`;
    this.logger.info(message, { details, userId, action });
  }
}
```

#### ACCESS LOG MIDDLEWARE

```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AccessLogMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const date = new Date().toISOString().split('T')[0];
    const dirPath = path.join(__dirname, '../../logs', date);
    const filePath = path.join(dirPath, 'access.log');
    const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${req.ip}\n`;

    fs.mkdirSync(dirPath, { recursive: true });
    fs.appendFile(filePath, log, (err) => {
      if (err) console.error('Access log error:', err);
    });

    next();
  }
}
```

#### ERROR LOGGING INTERCEPTOR

```ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CustomLoggerService } from '../logger/logger.service';

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const userId = user?.id || 'anonymous';

    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof HttpException) {
          this.logger.warn(
            `HTTP Exception: ${error.message}`,
            `${method} ${url} - User: ${userId}`,
          );
        } else {
          this.logger.logError(error, `${method} ${url}`, userId);
        }

        return throwError(() => error);
      }),
    );
  }
}
```

#### LOG DIRECTORY STRUCTURE

- The logging system creates the following directory structure:

```bash
logs/
├── 2025-07-02/
│   ├── app-2025-07-02.log
│   ├── error-2025-07-02.log
│   └── access-2025-07-02.log
```

- `access.log` file example:

```bash
[2025-07-02T03:00:40.703Z] GET /note - ::1
[2025-07-02T03:00:56.284Z] DELETE /note/831e30b7-fe9c-435d-a93a-a15f4bd89800 - ::1
[2025-07-02T03:01:34.127Z] DELETE /note/831e30b7-fe9c-435d-a93a-a15f4bd89800 - ::1
[2025-07-02T03:02:28.800Z] GET /note/831e30b7-fe9c-435d-a93a-a15f4bd89800 - ::1
[2025-07-02T03:03:17.153Z] GET /note - ::1
[2025-07-02T03:04:29.311Z] POST /note - ::1
[2025-07-02T03:04:54.345Z] POST /note - ::1
[2025-07-02T03:05:11.179Z] POST /auth/refresh - ::1
[2025-07-02T03:05:17.382Z] POST /note - ::1
[2025-07-02T03:05:52.582Z] GET /note - ::1
[2025-07-02T03:26:55.958Z] GET /note - ::1
[2025-07-02T03:26:56.293Z] GET /note - ::1
[2025-07-02T03:26:56.715Z] GET /note - ::1
[2025-07-02T03:26:57.215Z] GET /note - ::1
[2025-07-02T03:26:58.375Z] GET /note - ::1
[2025-07-02T03:26:59.760Z] GET /note - ::1
[2025-07-02T03:27:00.292Z] GET /note - ::1
[2025-07-02T03:27:00.747Z] GET /note - ::1
[2025-07-02T04:33:54.410Z] GET / - ::1
[2025-07-02T04:33:56.723Z] GET /note - ::1
[2025-07-02T04:33:56.769Z] GET /favicon.ico - ::1
```

- `app.log` file example:

```ts
{"level":"info","message":"[verifyToken] SUCCESS: user 9bfe9367-a08f-4238-aabc-0b361bdb9117 - 1ms","timestamp":"10:05:17 2/7/2025"}
{"level":"info","message":"[createNote] START: userId=9bfe9367-a08f-4238-aabc-0b361bdb9117 2025-07-02T03:05:17.390Z","timestamp":"10:05:17 2/7/2025"}
{"level":"info","message":"[createNote] QUEUED: userId=9bfe9367-a08f-4238-aabc-0b361bdb9117 - 3ms","timestamp":"10:05:17 2/7/2025"}
{"level":"info","message":"[NoteProcessor] START job=after_create_note id=15","timestamp":"10:05:17 2/7/2025"}
{"level":"info","message":"[NoteProcessor] Created note 7476bbbb-c41d-4eff-9cf0-b96fac19c1a2 for user 9bfe9367-a08f-4238-aabc-0b361bdb9117","timestamp":"10:05:17 2/7/2025"}
{"level":"info","message":"[NoteProcessor] DONE job=after_create_note id=7476bbbb-c41d-4eff-9cf0-b96fac19c1a2 - 10016ms","timestamp":"10:05:27 2/7/2025"}
{"level":"info","message":"[getAllNote] START 2025-07-02T03:05:52.582Z","timestamp":"10:05:52 2/7/2025"}
{"level":"info","message":"[getAllNote] SUCCESS - 3 notes - 5ms","timestamp":"10:05:52 2/7/2025"}
{"level":"info","message":"[getAllNote] START 2025-07-02T03:18:34.477Z","timestamp":"10:18:34 2/7/2025"}
{"level":"info","message":"[getAllNote] SUCCESS - 3 notes - 12ms","timestamp":"10:18:34 2/7/2025"}
{"level":"info","message":"[getAllNote] START 2025-07-02T03:18:35.036Z","timestamp":"10:18:35 2/7/2025"}
{"level":"info","message":"[getAllNote] SUCCESS - 3 notes - 5ms","timestamp":"10:18:35 2/7/2025"}
{"level":"info","message":"[getAllNote] START 2025-07-02T03:18:35.515Z","timestamp":"10:18:35 2/7/2025"}
{"level":"info","message":"[getAllNote] SUCCESS - 3 notes - 5ms","timestamp":"10:18:35 2/7/2025"}
{"level":"info","message":"[getAllNote] START 2025-07-02T03:18:35.896Z","timestamp":"10:18:35 2/7/2025"}
```

#### APPLICATION MODULE SETUP

```ts
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from './logger/logger.module';
import { AccessLogMiddleware } from './middleware/access-log.middleware';
import { ErrorLoggingInterceptor } from './interceptors/error-logging.interceptor';

@Module({
  imports: [LoggerModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorLoggingInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AccessLogMiddleware).forRoutes('*');
  }
}
```

#### USAGE IN SERVICES

- Take `note.service.ts` file for example:

```ts
import {
  BadRequestException,
  Injectable,
  LoggerService,
  Inject,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NoteDto } from './dto/note.dto';
import { NoteCreateDto } from './dto/note-create.dto';
import { NoteUpdateDto } from './dto/note-update.dto';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
    @InjectQueue('note') private noteQueue: Queue,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async getAllNote(): Promise<NoteDto[]> {
    const start = Date.now();
    this.logger.log(`[getAllNote] START ${new Date().toISOString()}`);
    try {
      const notesList: Note[] = await this.noteRepository.find({
        relations: ['user'],
      });

      const result = notesList.map((note) => NoteDto.fromEntity(note));
      const duration = Date.now() - start;
      this.logger.log(
        `[getAllNote] SUCCESS - ${result.length} notes - ${duration}ms`,
      );
      return result;
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[getAllNote] ERROR - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new Error('Something error, cannot get notes');
    }
  }

  async getNote(noteId: string): Promise<NoteDto | null> {
    const start = Date.now();
    this.logger.log(`[getNote] START: ${noteId} ${new Date().toISOString()}`);
    try {
      const note = await this.noteRepository.findOne({
        where: { id: noteId },
        relations: ['user'],
      });

      if (!note) {
        this.logger.warn(`[getNote] NOT FOUND: ${noteId}`);
        return null;
      }

      const result = NoteDto.fromEntity(note);
      const duration = Date.now() - start;
      this.logger.log(`[getNote] SUCCESS: ${noteId} - ${duration}ms`);
      return result;
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[getNote] ERROR: ${noteId} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new Error('Something error, cannot get this note');
    }
  }

  async create(
    noteCreateDto: NoteCreateDto,
    userId: string,
  ): Promise<{ message: string }> {
    const start = Date.now();
    this.logger.log(
      `[createNote] START: userId=${userId} ${new Date().toISOString()}`,
    );
    try {
      await this.noteQueue.add('after_create_note', {
        noteCreateDto,
        userId,
      });

      const duration = Date.now() - start;
      this.logger.log(`[createNote] QUEUED: userId=${userId} - ${duration}ms`);
      return { message: 'New note is creating...' };
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[createNote] ERROR - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new Error('Something error, cannot create new note');
    }
  }

  async delete(noteId: string): Promise<{ message: string }> {
    const start = Date.now();
    this.logger.log(
      `[deleteNote] START: ${noteId} ${new Date().toISOString()}`,
    );
    try {
      await this.noteQueue.add('delete_note', {
        noteId,
      });

      const duration = Date.now() - start;
      this.logger.log(`[deleteNote] QUEUED: ${noteId} - ${duration}ms`);
      return { message: 'Deleting note...' };
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[deleteNote] ERROR: ${noteId} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new Error('Something error, cannot delete this note');
    }
  }

  async update(noteUpdateDto: NoteUpdateDto, noteId: string): Promise<NoteDto> {
    const start = Date.now();
    this.logger.log(
      `[updateNote] START: ${noteId} ${new Date().toISOString()}`,
    );
    try {
      const note: Note | null = await this.noteRepository.findOne({
        where: { id: noteId },
        relations: ['user'],
      });

      if (!note) {
        this.logger.warn(`[updateNote] NOT FOUND: ${noteId}`);
        throw new BadRequestException("Note doesn't exist, cannot update");
      }

      await this.noteRepository.update(noteId, noteUpdateDto);
      const duration = Date.now() - start;
      this.logger.log(`[updateNote] SUCCESS: ${noteId} - ${duration}ms`);
      return NoteDto.fromEntity(note);
    } catch (err) {
      const duration = Date.now() - start;
      this.logger.error(
        `[updateNote] ERROR: ${noteId} - ${err.message} - ${duration}ms`,
        err.stack,
      );
      throw new Error('Something error, cannot update this note');
    }
  }
}
```

### CRON JOBS

- NestJS provides powerful scheduling capabilities with cron jobs and comprehensive request/response handling through interceptors. Cron jobs handle automated tasks while interceptors manage cross-cutting concerns like logging, transformation, and error handling.

#### CRON JOBS SETUP

```bash
npm install @nestjs/schedule
npm install @types/cron
```

#### BASIC CRON SERVICE

```ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CustomLoggerService } from '../logger/logger.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly customLogger: CustomLoggerService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  @Cron('0 * * * * *')
  handleCron() {
    this.logger.debug('Called when the current second is 0');
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyCleanup() {
    const start = Date.now();
    this.customLogger.log('[DailyCleanup] START');
    
    try {
      await this.cleanupExpiredSessions();
      await this.archiveOldLogs();
      
      const duration = Date.now() - start;
      this.customLogger.log(`[DailyCleanup] SUCCESS - ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - start;
      this.customLogger.logError(error, 'DailyCleanup', undefined);
    }
  }

  @Cron('0 0 3 * * 1')
  async handleWeeklyReport() {
    const start = Date.now();
    this.customLogger.log('[WeeklyReport] START');
    
    try {
      await this.generateWeeklyReport();
      
      const duration = Date.now() - start;
      this.customLogger.log(`[WeeklyReport] SUCCESS - ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - start;
      this.customLogger.logError(error, 'WeeklyReport', undefined);
    }
  }

  private async cleanupExpiredSessions() {
    this.logger.debug('Cleaning up expired sessions');
  }

  private async archiveOldLogs() {
    this.logger.debug('Archiving old logs');
  }

  private async generateWeeklyReport() {
    this.logger.debug('Generating weekly report');
  }
}
```

#### ADVANCED CRON SERVICE WITH DYNAMIC JOBS

```ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { CustomLoggerService } from '../logger/logger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../note/note.entity';

@Injectable()
export class AdvancedTaskService {
  private readonly logger = new Logger(AdvancedTaskService.name);
  private jobCounter = 0;

  constructor(
    private readonly customLogger: CustomLoggerService,
    private schedulerRegistry: SchedulerRegistry,
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
  ) {}

  @Cron('0 0 * * * *', {
    name: 'database-cleanup',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleDatabaseCleanup() {
    const start = Date.now();
    this.customLogger.log('[DatabaseCleanup] START');
    
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const result = await this.noteRepository
        .createQueryBuilder()
        .delete()
        .where('deletedAt < :date', { date: thirtyDaysAgo })
        .andWhere('deletedAt IS NOT NULL')
        .execute();

      const duration = Date.now() - start;
      this.customLogger.log(
        `[DatabaseCleanup] SUCCESS - Deleted ${result.affected} records - ${duration}ms`
      );
    } catch (error) {
      const duration = Date.now() - start;
      this.customLogger.logError(error, 'DatabaseCleanup', undefined);
    }
  }

  addCronJob(name: string, seconds: string, callback: () => void) {
    const job = new CronJob(`${seconds} * * * * *`, callback);

    this.schedulerRegistry.addCronJob(name, job);
    job.start();

    this.customLogger.log(`Job ${name} added for each minute at ${seconds} seconds!`);
  }

  deleteCron(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
    this.customLogger.log(`Job ${name} deleted!`);
  }

  getCrons() {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((value, key) => {
      let next;
      try {
        next = value.nextDates().toDate();
      } catch (e) {
        next = 'error: next fire date is in the past!';
      }
      this.logger.log(`job: ${key} -> next: ${next}`);
    });
  }

  @Cron('0 30 2 * * *', {
    name: 'database-backup',
  })
  async handleDatabaseBackup() {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      const start = Date.now();
      attempt++;
      
      this.customLogger.log(`[DatabaseBackup] ATTEMPT ${attempt}/${maxRetries}`);
      
      try {
        await this.performBackup();
        
        const duration = Date.now() - start;
        this.customLogger.log(`[DatabaseBackup] SUCCESS - ${duration}ms`);
        return;
      } catch (error) {
        const duration = Date.now() - start;
        this.customLogger.error(
          `[DatabaseBackup] ATTEMPT ${attempt} FAILED - ${duration}ms`,
          error.stack
        );
        
        if (attempt === maxRetries) {
          this.customLogger.logError(error, 'DatabaseBackup', undefined);
          // Send alert notification
          await this.sendBackupFailureAlert(error);
        } else {
          // Wait before retry
          await this.sleep(5000 * attempt);
        }
      }
    }
  }

  private async performBackup() {
    this.logger.debug('Performing database backup');
    await this.sleep(2000);
  }

  private async sendBackupFailureAlert(error: Error) {
    this.logger.error('Sending backup failure alert', error.stack);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### COMMON CRON EXPRESSIONS

```bash
# Every second
* * * * * *

# Every minute
0 * * * * *

# Every hour at minute 30
0 30 * * * *

# Every day at 2:30 AM
0 30 2 * * *

# Every Monday at 3 AM
0 0 3 * * 1

# Every 1st day of month at midnight
0 0 0 1 * *

# Every weekday at 9 AM
0 0 9 * * 1-5

# Every 15 minutes
0 */15 * * * *
```

#### MONITORING CRON JOBS

```ts
import { Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CustomLoggerService } from '../logger/logger.service';

@Injectable()
export class CronMonitorService {
  constructor(
    private readonly logger: CustomLoggerService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  @Cron('0 */5 * * * *')
  monitorCronJobs() {
    const jobs = this.schedulerRegistry.getCronJobs();
    
    jobs.forEach((job, name) => {
      const isRunning = job.running;
      const nextDate = job.nextDate();
      
      this.logger.log(
        `[CronMonitor] Job: ${name}, Running: ${isRunning}, Next: ${nextDate?.toISOString()}`
      );
    });
  }
}
```


### THROTTLING - AVOID SPAM

- NestJS provides rate limiting capabilities through throttler guards to prevent abuse and protect your API from excessive requests. The throttler can be configured globally or per route with customizable limits and time windows.

#### THROTTLING SETUP

```bash
npm install @nestjs/throttler
```

#### MODULE CONFIGURATION

```ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100
      }
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

#### CONTROLLER WITH THROTTLING

```ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @Throttle({ short: { limit: 1, ttl: 5000 } })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @SkipThrottle()
  async getProfile() {
    return this.authService.getProfile();
  }

  @Post('forgot-password')
  @Throttle({ medium: { limit: 3, ttl: 300000 } })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }
}
```

#### CUSTOM THROTTLER GUARD

```ts
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
    throttler: any,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = this.generateKey(context, request.ip, throttler.name);
    
    const { totalHits, timeToExpire } = await this.storageService.increment(
      key,
      ttl,
    );

    if (totalHits > limit) {
      const remainingTime = Math.ceil(timeToExpire / 1000);
      throw new ThrottlerException(
        `Rate limit exceeded. Try again in ${remainingTime} seconds.`
      );
    }

    return true;
  }

  protected generateKey(
    context: ExecutionContext,
    suffix: string,
    name: string,
  ): string {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || 'anonymous';
    return `${name}-${userId}-${suffix}`;
  }
}
```
