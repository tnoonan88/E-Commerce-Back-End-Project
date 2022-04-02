const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');
const { update } = require('../../models/Product');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [Category, {model: Tag, through: ProductTag}]
    });
    if (!productData) {
      res.status(404).json({message: 'No products found!'});
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get product by ID
router.get('/:id', async (req, res) => {
  try {
    const singleProduct = await Product.findByPk(req.params.id, {
      include: [Category, {model: Tag, through: ProductTag}]
    });
    if (!singleProduct) {
      res.status(404).json({message: 'No product with that ID found.'});
      return;
    }
    res.status(200).json(singleProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', (req, res) => {
  // try {
  //   const createProduct = await Product.create(req.body);
  //   res.status(200).json(createProduct);
  // } catch (err) {
  //   res.status(400).json(err);
  // }
  /* req.body should look like this... FOR INSOMNIA
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
 console.log(req.body)
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds && req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', async (req, res) => {
  // try {
  //   const updateProduct = await Product.update(req.body, {
  //     where: {
  //       id: req.params.id,
  //     },
  //   })
  //   if (!updateProduct) {
  //     res.status(404).json({message: 'No product found with this ID.'});
  //     return;
  //   }
  //   res.status(200).json(updateProduct);
  // } catch (err) {
  //   res.status(500).json(err);
  // }

  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      if (req.params.tagIds && req.params.tagIds.length) {
        const productTags = productTag.findall({where: {product_id: req.params.id}
        })};
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

// delete one product by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const deleteProduct = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!deleteProduct) {
      res.status(404).json({message: 'No product found with this ID.'});
      return;
    }
    res.status(200).json(deleteProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
