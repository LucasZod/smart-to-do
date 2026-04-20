import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm'
import { Task } from '../../tasks/entities/task.entity'

@Entity()
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  objective: string

  @OneToMany(() => Task, (task) => task.goal, { cascade: true, eager: true })
  tasks: Task[]

  @CreateDateColumn()
  createdAt: Date
}
