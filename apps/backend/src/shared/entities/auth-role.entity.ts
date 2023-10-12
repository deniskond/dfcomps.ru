import { UserRole } from '@dfcomps/contracts';
import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity({ name: 'auth_roles' })
export class AuthRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  user_id: number;

  @Column({ type: 'character varying' })
  role: UserRole;
}
