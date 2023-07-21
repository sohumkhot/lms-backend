const request = require("supertest");

const stagingURL = "http://localhost:4000"; // Replace this with the actual URL of your staging server

describe("Loan Controller Tests", () => {
  let normalUserAuthToken; // This will hold the authentication token for the test user
  let adminAuthToken; // This will hold the authentication token for the test admin
  let newLoanId; // This loan will be approved and used in valid repayments test
  let newLoanIdUnapproved; // This loan will stay pending and will be used to test error cases

  beforeAll(async () => {
    // Log in as a test user to get the authentication token
    const normalUserCredentials = {
      email: `existinguser@gmail.com`,
      password: "testpassword",
    };

    const userResponse = await request(stagingURL)
      .post("/api/v1/login")
      .send(normalUserCredentials);

    normalUserAuthToken = userResponse.body.token;

    const adminCredentials = {
      email: `existingadmin1@gmail.com`,
      password: "testpassword",
    };

    const adminResponse = await request(stagingURL)
      .post("/api/v1/login")
      .send(adminCredentials);

    adminAuthToken = adminResponse.body.token;
  });

  it("should create a new loan on staging", async () => {
    const newLoan = {
      amount: 1000,
      numberOfInstallments: 3,
    };

    const response = await request(stagingURL)
      .post("/api/v1/loans/create")
      .set("Cookie", `token=${normalUserAuthToken}`)
      .send(newLoan);

    newLoanId = response.body._id;
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.amount).toBe(newLoan.amount);
    expect(response.body.numberOfInstallments).toBe(
      newLoan.numberOfInstallments
    );
  });

  it("should get loan details by ID on staging", async () => {
    const existingLoanId = newLoanId;

    const response = await request(stagingURL)
      .get(`/api/v1/loans/${existingLoanId}`)
      .set("Cookie", `token=${normalUserAuthToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("_id", existingLoanId);
  });

  it("shouldnt get loan details by invalid ID", async () => {
    const invalidLoanId = "64ba2a4c2eddc32e1cf22221";

    const response = await request(stagingURL)
      .get(`/api/v1/loans/${invalidLoanId}`)
      .set("Cookie", `token=${normalUserAuthToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe("Loan not found");
  });

  it("user1 shouldnt get loan details of user2", async () => {
    const existingLoanId = newLoanId;

    const response = await request(stagingURL)
      .get(`/api/v1/loans/${existingLoanId}`)
      .set("Cookie", `token=${adminAuthToken}`);

    expect(response.statusCode).toBe(401);
    expect(response.body.error).toBe("Unauthorized");
  });

  it("should get all loans on staging for a user", async () => {
    const response = await request(stagingURL)
      .get("/api/v1/loans")
      .set("Cookie", `token=${normalUserAuthToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("normal user shouldnt be able to approve a loan", async () => {
    const response = await request(stagingURL)
      .put(`/api/v1/loans/${newLoanId}/approve`)
      .set("Cookie", `token=${normalUserAuthToken}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.error).toBe(
      "Role: user is not allowed to access this resource"
    );
  });

  it("admin should be able to approve a loan", async () => {
    const response = await request(stagingURL)
      .put(`/api/v1/loans/${newLoanId}/approve`)
      .set("Cookie", `token=${adminAuthToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("approved");
  });

  it("user shouldnt be able to repay an unapproved loan", async () => {
    const newLoan = {
      amount: 1000,
      numberOfInstallments: 12,
    };

    const newLoanResponse = await request(stagingURL)
      .post("/api/v1/loans/create")
      .set("Cookie", `token=${normalUserAuthToken}`)
      .send(newLoan);

    newLoanIdUnapproved = newLoanResponse.body._id;

    const repaymentBody = {
      amount: 80,
    };
    const response = await request(stagingURL)
      .post(`/api/v1/loans/${newLoanIdUnapproved}/repayment`)
      .set("Cookie", `token=${normalUserAuthToken}`)
      .send(repaymentBody);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Loan is pending approval");
  });

  it("user shouldnt be able to repay loan with repayment amount less than the required installment amount", async () => {
    const repaymentBody = {
      amount: 80,
    };
    const response = await request(stagingURL)
      .post(`/api/v1/loans/${newLoanId}/repayment`)
      .set("Cookie", `token=${normalUserAuthToken}`)
      .send(repaymentBody);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe(
      "Repayment amount should be greater than or equal to the amount of the Installment"
    );
  });

  it("user should be able to repay the loan", async () => {
    const repaymentBody = {
      amount: 333.33,
    };
    const firstRepaymentResponse = await request(stagingURL)
      .post(`/api/v1/loans/${newLoanId}/repayment`)
      .set("Cookie", `token=${normalUserAuthToken}`)
      .send(repaymentBody);

    expect(firstRepaymentResponse.statusCode).toBe(200);
    expect(firstRepaymentResponse.body.status).toBe("approved");

    let paidInstallmentsCount = firstRepaymentResponse.body.installments.filter(
      (installment) => installment.status === "paid"
    ).length;

    expect(paidInstallmentsCount).toBe(1);

    const secondRepaymentResponse = await request(stagingURL)
      .post(`/api/v1/loans/${newLoanId}/repayment`)
      .set("Cookie", `token=${normalUserAuthToken}`)
      .send(repaymentBody);

    expect(secondRepaymentResponse.statusCode).toBe(200);
    expect(secondRepaymentResponse.body.status).toBe("approved");

    paidInstallmentsCount = secondRepaymentResponse.body.installments.filter(
      (installment) => installment.status === "paid"
    ).length;

    expect(paidInstallmentsCount).toBe(2);

    const thirdRepaymentResponse = await request(stagingURL)
      .post(`/api/v1/loans/${newLoanId}/repayment`)
      .set("Cookie", `token=${normalUserAuthToken}`)
      .send(repaymentBody);

    expect(thirdRepaymentResponse.statusCode).toBe(200);
    expect(thirdRepaymentResponse.body.status).toBe("paid");

    paidInstallmentsCount = thirdRepaymentResponse.body.installments.filter(
      (installment) => installment.status === "paid"
    ).length;

    expect(paidInstallmentsCount).toBe(3);
  });

  it("user shouldnt be able to repay a loan that is fully paid", async () => {
    const repaymentBody = {
      amount: 333.33,
    };
    const response = await request(stagingURL)
      .post(`/api/v1/loans/${newLoanId}/repayment`)
      .set("Cookie", `token=${normalUserAuthToken}`)
      .send(repaymentBody);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Loan is already paid");
  });
});
