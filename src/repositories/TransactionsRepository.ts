import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = Number(
      transactions
        .map(item => {
          if (item.type === 'income') {
            return item.value;
          }
        })
        .filter(item => item)
        .reduce((a, b) => Number(a) + Number(b), 0),
    );

    const outcome = Number(
      transactions
        .map(item => {
          if (item.type === 'outcome') {
            return item.value;
          }
        })
        .filter(item => item)
        .reduce((a, b) => Number(a) + Number(b), 0),
    );

    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
