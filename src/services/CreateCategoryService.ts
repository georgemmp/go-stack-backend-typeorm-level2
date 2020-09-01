import { getRepository } from 'typeorm';
import Category from '../models/Category';

interface CategoryDTO {
  title: string;
}

export default class CreateCategoryService {
  public async execute({ title }: CategoryDTO): Promise<Category> {
    const repository = getRepository(Category);

    const titleCategoryExists = await repository.findOne({
      title,
    });

    if (titleCategoryExists) {
      return titleCategoryExists;
    }

    const category = repository.create({ title });

    await repository.save(category);

    return category;
  }
}
