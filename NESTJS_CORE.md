## ENVIRONMENT INSTALLATION

### INSTALL NESTJS

- Use this command to install `NestJS`, `cli` is command line interface

``` bash
sudo npm install -g @nestjs/cli
```

- To create new project, we follow to command:

```bash
nest new trungproject
```

- After creating project, we run the following command to start project:

``` bash
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

- `Scope.DEFAULT` *(default)*  
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
  getUserPost(
    @Param('id') userId: string,
    @Param('postId') postId: string
  ) {
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
    @Body() updateUserDto: Partial<CreateUserDto>
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
  getUser(
    @Param('id') id: string,
    @Query('include') include?: string
  ) {
    return `User ${id}, include: ${include}`;
  }

  @Post(':id/posts')
  createUserPost(
    @Param('id') userId: string,
    @Body() postData: any,
    @Query('draft') isDraft?: boolean
  ) {
    return {
      userId,
      postData,
      isDraft: isDraft === true
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
import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';

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

  @OneToMany(() => Post, post => post.user)
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

  @ManyToOne(() => User, user => user.posts)
  user: User;
}
```

```ts
// Many-to-Many relationship
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Role, role => role.users)
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
import { IsString, IsEmail, IsNumber, Min, Max, IsOptional } from 'class-validator';

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
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Name can only contain letters and spaces' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain at least 8 characters, one uppercase, one lowercase and one number'
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
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
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

### PIPE

Pipes are used to transform and validate data. They run before the route handler method and can transform the input data or validate it.

#### BUILT-IN PIPES

```ts
import { Controller, Post, Body, Param, Query, ParseIntPipe, ParseBoolPipe } from '@nestjs/common';

@Controller('users')
export class UserController {
  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return `User ID: ${id}`;
  }

  @Get()
  getUsers(
    @Query('page', ParseIntPipe) page: number,
    @Query('active', ParseBoolPipe) active: boolean
  ) {
    return `Page: ${page}, Active: ${active}`;
  }
}
```

#### VALIDATION PIPE

```ts
import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
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
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // Remove properties not in DTO
    forbidNonWhitelisted: true, // Throw error for extra properties
    transform: true,           // Auto-transform payloads to DTO instances
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  await app.listen(3000);
}
bootstrap();
```

#### CUSTOM PIPE

```ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

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
    @Query('notify', ParseBoolPipe) notify: boolean
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

### AUTHENTICATION AND AUTHORIZATION

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

