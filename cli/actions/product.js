const inquirer = require("inquirer");
const ora = require("ora");
const {
  createProduct,
  createVariableProduct,
  retrieveProductService,
  duplicateProductService,
  fetchAllProductsService,
} = require("../../services/productService");
const { envClient } = require("../../utils/wooClient");

//Create Products
async function handleProduct() {
  const inputs = await inquirer.prompt([
    {
      type: "list",
      name: "type",
      message: "What kind of product do you want to create?",
      choices: [
        { name: "> Simple Product", value: "simple" },
        { name: "> Variable Product", value: "variable" },
      ],
    },
    { name: "price", message: "Enter price:" },
    { name: "weight", message: "Enter weight:" },
    { name: "length", message: "Enter length:" },
    { name: "width", message: "Enter width:" },
    { name: "height", message: "Enter height:" },
    {
      name: "numOfProducts",
      message: "How many products of similar kind to create?",
    },
  ]);

  // Simple Product
  if (inputs.type === "simple") {
    const spinner = ora(`Processing`).start();

    try {
      await createProduct(envClient(), inputs, parseInt(inputs.numOfProducts));
      spinner.succeed("Products Created ✅");
    } catch (err) {
      spinner.fail("Failed ❌");
      console.log(err.message);
    }
  }

  // Variable Product
  if (inputs.type === "variable") {
    const spinner = ora(`Processing`).start();

    try {
      await createVariableProduct(
        envClient(),
        inputs,
        inputs,
        parseInt(inputs.numOfProducts),
      );
      spinner.succeed("Products Created ✅");
    } catch (err) {
      spinner.fail("Failed ❌");
      console.log(err.message);
    }
  }
}

//Retrieve Product
async function retrieveProduct() {
  const inputs = await inquirer.prompt([
    {
      type: "input",
      name: "productId",
      message: "Enter the Product Id of the product you want to retrieve: ",
    },
  ]);

  if (inputs.productId) {
    const spinner = ora(`Processing`).start();

    try {
      const product = await retrieveProductService(
        envClient(),
        Number(inputs.productId),
      );
      spinner.succeed("Product Data fetched Successfully... 👍");
      console.log(product);
    } catch (error) {
      spinner.fail("Product fetching Failed 👎 ");
      console.log(error.message);
    }
  }
}

//Duplicate Product
async function duplicateProduct() {
  const input = await inquirer.prompt([
    {
      type: "input",
      name: "productId",
      message: "Enter the product Id of the product you want to duplicate: ",
    },
    {
      type: "input",
      name: "numOfProducts",
      message: "Enter the number of duplicated products you want: ",
    },
  ]);
  const spinner = ora("Processing").start();

  try {
    await duplicateProductService(envClient(), input.productId, input.numOfProducts);
    spinner.succeed("Product Duplication Successful.");
  } catch (error) {
    spinner.fail();
  }
}

//Fetch All Products
async function fetchAllProducts() {
  const spinner = ora("Processing...").start();

  try {
    const products = await fetchAllProductsService(envClient());

    spinner.succeed("Products fetched successfully\n");

    console.log("Response:\n");

    products.forEach((product) => {
      console.log(
        `Product ID: ${product.id} ---------- Name: ${product.name} ----------- Status: ${product.status}`,
      );
    });
  } catch (err) {
    spinner.fail("Failed to fetch products");
    console.log(err.message);
  }
}

module.exports = {
  handleProduct,
  retrieveProduct,
  duplicateProduct,
  fetchAllProducts,
};
