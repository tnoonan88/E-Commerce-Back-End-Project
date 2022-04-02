const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

// get all categories
router.get('/', async (req, res) => {
  try {
    const categoryData = await Category.findAll();
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get product by ID
router.get('/:id', async (req, res) => {
  try {
    const singleCategory = await Category.findByPk(req.params.id, {
      include: [Product]
    });
    if (!singleCategory) {
      res.status(404).json({message: 'No category found with this ID.'});
      return;
    }
    res.status(200).json(singleCategory);
  } catch (err) {
    res.status(500).json(err);
  }
});


// create new category
router.post('/', async (req, res) => {
  try {
    const createCat = await Category.create(req.body);
    res.status(200).json(createCat);
  } catch (err) {
    res.status(400).json(err);
  }
});

// update category
router.put('/:id', async (req, res) => {
  try {
    const updateCat = await Category.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    if (!updateCat) {
      res.status(404).json({message: 'No category found with this ID.'});
      return;
    }
    res.status(200).json(updateCat);
  } catch (err) {
    res.status(500).json(err);
  }
});

// delete a category
router.delete('/:id', async (req, res) => {
  try {
    const deleteCat = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!deleteCat) {
      res.status(404).json({message: 'No category found with this ID.'});
      return;
    }
    res.status(200).json(deleteCat);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
