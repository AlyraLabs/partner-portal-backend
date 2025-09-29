import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: 'Welcome to Partner Portal Backend API',
      version: '1.0.0',
      endpoints: {
        auth: '/auth',
        health: '/health',
      },
    };
  }
}
