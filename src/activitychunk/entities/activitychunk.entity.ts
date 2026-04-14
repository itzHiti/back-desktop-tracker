import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['startedAt', 'appName', 'appUrl'])
export class ActivityChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  startedAt: Date;

  @Column()
  endedAt: Date;

  @Column()
  duration: number;

  @Column()
  appName: string;

  @Column({ type: 'text', nullable: true })
  appUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
