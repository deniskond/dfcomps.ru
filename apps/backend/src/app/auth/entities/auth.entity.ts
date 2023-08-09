import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity({ name: 'auth' })
export class Auth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  login: string;

  @Column({ type: 'varchar' })
  password: string;
}
