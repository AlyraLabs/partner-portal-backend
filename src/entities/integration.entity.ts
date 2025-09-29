import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { User } from './user.entity';
import * as crypto from 'crypto';

@Entity('integrations')
export class Integration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  url?: string;

  @Column({ unique: true })
  uniqueString: string;

  @Column({ unique: true })
  apiKey: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 25 })
  fee: number;

  @Column({ type: 'integer', default: 200 })
  rpm: number;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateCredentials() {
    if (!this.apiKey) {
      this.apiKey = this.generateApiKey();
    }
  }

  private generateApiKey(): string {
    // Generate a secure API key
    return `ppk_${crypto.randomBytes(32).toString('hex')}`;
  }
}
