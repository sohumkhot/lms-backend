const express = require("express");
const {
  createLoan,
  getLoanById,
  getLoans,
  approveLoanById,
  repayLoanById,
} = require("../controllers/loanController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/loans/create").post(isAuthenticatedUser, createLoan);

router.route("/loans/:id").get(isAuthenticatedUser, getLoanById);

router.route("/loans").get(isAuthenticatedUser, getLoans);

router
  .route("/loans/:id/approve")
  .put(isAuthenticatedUser, authorizeRoles("admin"), approveLoanById);

router.route("/loans/:id/repayment").post(isAuthenticatedUser, repayLoanById);

module.exports = router;
