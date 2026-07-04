import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
  genSalt: vi.fn(),
  hash: vi.fn(),
}));

const mockPrismaService = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

const mockJwtService = {
  signAsync: vi.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return token and user if credentials are valid', async () => {
      const mockUser = { id: 'user1', name: 'Test', email: 'test@test.com', password: 'hashedpassword' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockJwtService.signAsync.mockResolvedValue('jwt_token');

      const result = await service.login('test@test.com', 'password123');

      expect(result).toEqual({
        access_token: 'jwt_token',
        user: { id: 'user1', name: 'Test', email: 'test@test.com' }
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ sub: 'user1', email: 'test@test.com' });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login('test@test.com', 'password123')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const mockUser = { id: 'user1', name: 'Test', email: 'test@test.com', password: 'hashedpassword' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.login('test@test.com', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should hash password, create user, and return token', async () => {
      const mockUser = { id: 'user2', name: 'New User', email: 'new@test.com', password: 'hashed' };
      vi.mocked(bcrypt.genSalt).mockResolvedValue('salt' as never);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('jwt_token_new');

      const result = await service.register('New User', 'new@test.com', 'pass123');

      expect(result).toEqual({
        access_token: 'jwt_token_new',
        user: { id: 'user2', name: 'New User', email: 'new@test.com' }
      });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('pass123', 'salt');
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: { name: 'New User', email: 'new@test.com', password: 'hashed' }
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ sub: 'user2', email: 'new@test.com' });
    });
  });
});
