import { UserRoles } from '@dfcomps/auth';
import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity({ name: 'auth_roles' })
export class AuthRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  user_id: number;

  @Column({ type: 'character varying' })
  role: UserRoles;
}
