const mongoose = require("mongoose");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Loan = require("../models/loanModel");
const { generateInstallments } = require("../utils/installments");

// Creates a Loan
exports.createLoan = catchAsyncErrors(async (req, res, next) => {
  const { amount, numberOfInstallments } = req.body;
  if (!numberOfInstallments || numberOfInstallments <= 0) {
    return next(
      new ErrorHandler(
        "Number of Installments should be a positive number",
        400
      )
    );
  }

  const installments = generateInstallments(amount, numberOfInstallments);

  const loan = await Loan.create({
    user: req.user.id,
    amount,
    numberOfInstallments,
    installments,
    status: "pending",
  });

  res.status(200).json(loan);
});

// Gets Loan details by ID
exports.getLoanById = catchAsyncErrors(async (req, res, next) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    return next(new ErrorHandler("Loan not found", 404));
  }

  if (loan.user.toHexString() !== req.user.id) {
    return next(new ErrorHandler("Unauthorized", 401));
  }

  res.status(200).json(loan);
});

// Gets Loans details
exports.getLoans = catchAsyncErrors(async (req, res, next) => {
  const loans = await Loan.find({ user: req.user.id });

  res.status(200).json(loans);
});

// Updates Loan details by ID. This route will be used to approve or deny the loan
exports.approveLoanById = catchAsyncErrors(async (req, res, next) => {
  const session = await mongoose.startSession();

  // Start a MongoDB Transaction
  session.startTransaction();

  try {
    const options = { session };
    const loan = await Loan.findById(req.params.id, null, options);

    if (!loan) {
      return next(new ErrorHandler("Loan not found", 404));
    }

    if (loan.status !== "approved") {
      loan.status = "approved";
      await loan.save(options);
    }

    await session.commitTransaction();

    res.status(200).json(loan);
  } catch (error) {
    // If any error is encountered, abort the transaction
    await session.abortTransaction();
    next(error);
  } finally {
    // End the session
    session.endSession();
  }
});

// Repay Loan by ID. This route will be used to repay an approved loan
exports.repayLoanById = catchAsyncErrors(async (req, res, next) => {
  const session = await mongoose.startSession();
  const { amount } = req.body;

  // Start a MongoDB Transaction
  session.startTransaction();

  try {
    const options = { session };
    const loan = await Loan.findById(req.params.id, null, options);

    if (!loan) {
      return next(new ErrorHandler("Loan not found", 404));
    }

    if (loan.status === "pending") {
      return next(new ErrorHandler("Loan is pending approval", 200));
    }

    if (loan.status === "paid") {
      return next(new ErrorHandler("Loan is already paid", 200));
    }

    if (amount < loan.installments[0].amount) {
      return next(
        new ErrorHandler(
          "Repayment amount should be greater than or equal to the amount of the Installment",
          400
        )
      );
    }

    const nextPendingInstallmentIndex = loan.installments.findIndex(
      (installment) => installment.status === "pending"
    );

    loan.installments[nextPendingInstallmentIndex].status = "paid";

    const pendingInstallments = loan.installments.filter(
      (installment) => installment.status === "pending"
    ).length;

    if (!pendingInstallments) {
      loan.status = "paid";
    }

    await loan.save(options);

    await session.commitTransaction();

    res.status(200).json(loan);
  } catch (error) {
    // If any error is encountered, abort the transaction
    await session.abortTransaction();
    next(error);
  } finally {
    // End the session
    session.endSession();
  }
});
