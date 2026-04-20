import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Goal } from '../../goals/entities/goal.entity'

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @Column({ default: false })
  isCompleted: boolean

  @Column({ default: false })
  isAiGenerated: boolean

  @ManyToOne(() => Goal, (goal) => goal.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goalId' })
  goal: Goal

  @Column()
  goalId: string

  @CreateDateColumn()
  createdAt: Date
}
