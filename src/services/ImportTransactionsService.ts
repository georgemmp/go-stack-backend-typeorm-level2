/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import csvParse from 'csv-parse';
import fs from 'fs';

import { getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filepath: string): Promise<Transaction[]> {
    const repository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);

    const readCSVStream = fs.createReadStream(filepath);

    const parseStream = csvParse({
      fromLine: 2,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', line => {
      // console.log(line);
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const existsCategories = await categoryRepository.find({
      where: { title: In(categories) },
    });

    const categoriesTitles = existsCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !categoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoryRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existsCategories];

    const createdTransactions = repository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await repository.save(createdTransactions);

    await fs.promises.unlink(filepath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
