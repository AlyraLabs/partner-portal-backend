import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserResponse } from './types/user-response.type';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: UserResponse; accessToken: string }> {
    const { email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = this.userRepository.create({
      email,
      password,
    });

    const savedUser = await this.userRepository.save(user);

    this.emailService.sendWelcomeEmail(savedUser.email).catch((error) => {
      this.logger.error('Failed to send welcome email:', error);
    });

    const { password: _, ...userWithoutPassword } = savedUser;

    // Generate JWT token
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ user: UserResponse; accessToken: string }> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = user;

    // Generate JWT token
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  async validateUserById(userId: string): Promise<UserResponse | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists or not for security
      this.logger.warn(
        `Password reset requested for non-existent email: ${email}`,
      );
      return {
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Generate JWT reset token with 1-hour expiration
    const resetPayload = {
      sub: user.id,
      email: user.email,
      type: 'password_reset',
      iat: Math.floor(Date.now() / 1000),
    };

    const token = this.jwtService.sign(resetPayload, { expiresIn: '1h' });

    // Send email
    const emailSent = await this.emailService.sendPasswordResetEmail(
      user.email,
      token,
    );

    if (!emailSent) {
      this.logger.error(`Failed to send password reset email to ${user.email}`);
      throw new BadRequestException(
        'Failed to send password reset email. Please try again.',
      );
    }

    this.logger.log(`Password reset email sent to ${user.email}`);

    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      // Verify and decode JWT token (automatically checks expiration and signature)
      const decoded = this.jwtService.verify(token);

      // Verify token type
      if (decoded.type !== 'password_reset') {
        throw new BadRequestException('Invalid token type.');
      }

      // Find user
      const user = await this.userRepository.findOne({
        where: { id: decoded.sub },
      });
      if (!user || user.email !== decoded.email) {
        throw new BadRequestException('Invalid reset token.');
      }

      // Update user password
      user.password = newPassword; // The entity will hash it automatically due to @BeforeInsert/@BeforeUpdate
      await this.userRepository.save(user);

      // Send confirmation email
      await this.emailService.sendPasswordResetConfirmationEmail(user.email);

      this.logger.log(`Password reset completed for user ${user.email}`);

      return { message: 'Password has been reset successfully.' };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException(
          'Reset token has expired. Please request a new one.',
        );
      }
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid reset token.');
      }
      throw error;
    }
  }

  async validateResetToken(
    token: string,
  ): Promise<{ valid: boolean; message?: string }> {
    try {
      // Verify JWT token (automatically checks expiration and signature)
      const decoded = this.jwtService.verify(token);

      // Verify token type
      if (decoded.type !== 'password_reset') {
        return { valid: false, message: 'Invalid token type.' };
      }

      // Verify user still exists
      const user = await this.userRepository.findOne({
        where: { id: decoded.sub },
      });
      if (!user || user.email !== decoded.email) {
        return { valid: false, message: 'Invalid reset token.' };
      }

      return { valid: true };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return { valid: false, message: 'Reset token has expired.' };
      }
      if (error.name === 'JsonWebTokenError') {
        return { valid: false, message: 'Invalid reset token.' };
      }
      return { valid: false, message: 'Invalid reset token.' };
    }
  }

}
