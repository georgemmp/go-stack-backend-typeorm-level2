import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface SaveDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: TransactionDTO): Promise<Transaction> {
    const repository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const balance = await repository.getBalance();

    const { total } = balance;

    const findedCategory = await categoryRepository.findOne({
      title: category,
    });

    if (!findedCategory) {
      const newCategory = categoryRepository.create({ title: category });
      const categorySaved = await categoryRepository.save(newCategory);

      const transaction = await this.saveTransaction(
        { type, title, value },
        total,
        repository,
        categorySaved,
      );

      return transaction;
    }

    const transaction = await this.saveTransaction(
      { type, title, value },
      total,
      repository,
      findedCategory,
    );

    return transaction;
  }

  private async saveTransaction(
    { type, title, value }: SaveDTO,
    total: number,
    repository: TransactionsRepository,
    categorySaved: Category,
  ): Promise<Transaction> {
    if (type === 'outcome' && value > total) {
      throw new AppError(
        'The value is bigger than total balance in your account',
        400,
      );
    }

    const transaction = repository.create({
      title,
      value,
      type,
      category_id: categorySaved.id,
    });

    await repository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
