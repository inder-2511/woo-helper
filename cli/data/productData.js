const { faker } = require("@faker-js/faker");

const getSimpleProductData = (inputs) => ({
  name: faker.commerce.productName(),
  type: "simple",
  status: "publish",
  regular_price: inputs.price,
  description: faker.commerce.productDescription(),
  sku: faker.string.uuid(),
  weight: String(inputs.weight),
  dimensions: {
    length: String(inputs.length),
    width: String(inputs.width),
    height: String(inputs.height),
  },
  manage_stock: true,
  stock_quantity: 111111,
});

const getVariableProductData = (inputs) => ({
  name: faker.commerce.productName(),
  type: "variable",
  status: "publish",
  description: faker.commerce.productDescription(),
  sku: faker.string.uuid(),
  attributes: [
    {
      position: 0,
      name: "Colour",
      options: ["Black", "Green"],
      variation: true,
      visible: true,
    },
    {
      position: 1,
      name: "Size",
      options: ["S", "M"],
      variation: true,
      visible: true,
    },
  ],
});

const getVariantData = (inputs) => ({
  status: "publish",
  regular_price: inputs.price,
  description: faker.commerce.productDescription(),
  sku: faker.string.uuid(),
  weight: String(inputs.weight),
  dimensions: {
    length: String(inputs.length),
    width: String(inputs.width),
    height: String(inputs.height),
  },
  manage_stock: true,
  stock_quantity: 111111,
});

module.exports = {
  getSimpleProductData,
  getVariableProductData,
  getVariantData,
};
