const inquirer = require("inquirer");
const ora = require("ora");
const { envClient } = require("../../utils/wooClient");
const {
  createOrder,
} = require("../../services/orderService");

//Create Order
async function handleOrder() {
  const inputs = await inquirer.prompt([
    {
      name: "product",
      message: "Enter product ID of the product you want to order:",
      validate: (val) => !isNaN(val) || "Enter valid number",
    },
    {
      name: "qty",
      message: "Enter quantity:",
      validate: (val) => !isNaN(val) || "Enter valid number",
    },
    {
      name: "numOfOrders",
      message: "Enter number of orders you want to create:",
      validate: (val) => !isNaN(val) || "Enter valid number",
    },
  ]);

  const spinner = ora(`Processing`).start();

  try {
    await createOrder(envClient(), inputs, parseInt(inputs.numOfOrders));
    spinner.succeed("Orders Created Successfully ✅");
  } catch (err) {
    spinner.fail("Failed ❌");
    console.log(err.message);
  }
}

module.exports = { handleOrder };
