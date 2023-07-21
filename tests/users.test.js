const request = require("supertest");

const stagingURL = "https://loan-management-system-api.onrender.com"; // Replace this with the actual URL of your staging server

describe("User Controller Tests", () => {
  it("should register a new user", async () => {
    const newUser = {
      name: "John Doe",
      email: `john.doe${Math.floor(Math.random() * 100000)}@example.com`,
      password: "testpassword",
      role: "user",
    };

    const response = await request(stagingURL)
      .post("/api/v1/register")
      .send(newUser);

    expect(response.statusCode).toBe(201);
    expect(response.body.user.role).toBe("user");
    expect(response.body.token).toBeDefined();
  });

  it("should register a new admin", async () => {
    const newUser = {
      name: "John Doe",
      email: `john.doe${Math.floor(Math.random() * 100000)}@example.com`,
      password: "testpassword",
      role: "admin",
    };

    const response = await request(stagingURL)
      .post("/api/v1/register")
      .send(newUser);

    expect(response.statusCode).toBe(201);
    expect(response.body.user.role).toBe("admin");
    expect(response.body.token).toBeDefined();
  });

  it("should register a new user", async () => {
    const newUser = {
      name: "John Doe",
      email: `john.doe${Math.floor(Math.random() * 100000)}@example.com`,
      password: "testpassword",
      role: "user",
    };

    const response = await request(stagingURL)
      .post("/api/v1/register")
      .send(newUser);

    expect(response.statusCode).toBe(201);
    expect(response.body.token).toBeDefined();
  });

  it("should log in an existing user", async () => {
    const credentials = {
      email: "john.doe@example.com",
      password: "testpassword",
    };

    const response = await request(stagingURL)
      .post("/api/v1/login")
      .send(credentials);

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it("should not log in a non-existing user", async () => {
    const credentials = {
      email: "nonexistinguser@example.com",
      password: "testpassword",
    };

    const response = await request(stagingURL)
      .post("/api/v1/login")
      .send(credentials);

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe("Invalid email or password");
  });
});
