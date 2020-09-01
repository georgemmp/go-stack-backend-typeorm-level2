import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Transaction from './Transaction';

@Entity({ name: 'categories' })
class Category {
  @PrimaryGeneratedColumn({ type: 'uuid' })
  id: string;

  @Column()
  title: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Transaction, transaction => transaction.category)
  transactions: Transaction[];
}

export default Category;
