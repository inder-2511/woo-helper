const { faker } = require("@faker-js/faker");

const getCustomerData = () => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const state = faker.location.state({ abbreviated: true });
  const address = {
    first_name: firstName,
    last_name: lastName,
    address_1: faker.location.streetAddress(),
    city: faker.location.city(),
    state,
    postcode: faker.location.zipCode(),
    country: "US",
  };

  return {
    email: faker.internet
      .email({ firstName, lastName, provider: "example.com" })
      .toLowerCase(),
    first_name: firstName,
    last_name: lastName,
    username: `${firstName}.${lastName}.${faker.string.alphanumeric(6)}`.toLowerCase(),
    password: faker.internet.password({ length: 16 }),
    billing: { ...address, email: faker.internet.email().toLowerCase(), phone: faker.phone.number() },
    shipping: address,
  };
};

module.exports = { getCustomerData };
