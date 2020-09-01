import { Router } from 'express';
import CreateCategoryService from '../services/CreateCategoryService';

const categoriesRouter = Router();

categoriesRouter.post('/', async (request, response) => {
  const { title } = request.body;
  const service = new CreateCategoryService();

  const category = await service.execute({ title });

  return response.status(201).json(category);
});

export default categoriesRouter;
