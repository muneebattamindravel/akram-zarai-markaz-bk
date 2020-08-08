const app = require('..');
const categoriesController = require('../controllers/categories.controller');

app.post('/categories',categoriesController.createCategory);
app.patch('/categories/:id',categoriesController.updateCategory);
app.get('/categories',categoriesController.getAllCategories);
app.get('/categories/:id',categoriesController.getCategory);
app.delete('/categories/:id',categoriesController.deleteCategory);
