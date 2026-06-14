import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client'
import { QueryUserDto } from './dto/query-user.dto';
import { NotificationGateway } from '../../infra/websockets/notification.gateway';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationGateway: NotificationGateway
    ) { }

    async create(createUserDto: CreateUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email }
        });

        if (existingUser) {
            throw new ConflictException('The email is in used')
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(createUserDto.password, salt)

        const user = await this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
            },
        });

        const { password, ...result } = user;
        this.notificationGateway.emitEvent('user_created', result);
        return result;
    }

    async findAll(query: QueryUserDto) {
        const { page = 1, limit = 10, search, role, isActive } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = {
            ...(role && { role }),
            ...(isActive !== undefined && { isActive }),
            ...(search && {
                OR: [
                    { fullName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new NotFoundException('User not find')
        }
        return user;
    }

    async findByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new NotFoundException('User not find');
        }
        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        await this.findById(id);

        const dataToUpdate: any = { ...updateUserDto };

        if (dataToUpdate.password) {
            const salt = await bcrypt.genSalt(10);
            dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, salt);
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: dataToUpdate,
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                isActive: true,
            },
        });

        this.notificationGateway.emitEvent('user_updated', updatedUser);
        return updatedUser;



    }

    async remove(id: string) {
        await this.findById(id);
        const deletedUser = await this.prisma.user.update({
            where: { id },
            data: { isActive: false },
            select: { id: true, email: true, isActive: true },
        });
        
        this.notificationGateway.emitEvent('user_deleted', deletedUser);

        return deletedUser;
    }
}
