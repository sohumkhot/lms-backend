const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please Enter Loan Amount'],
    maxLength: [10, 'Amount cannot exceed 10 characters'],
    min: [1, 'Amount must be a positive number']
  },
  numberOfInstallments: {
    type: Number,
    required: [true, 'Please Enter Number of Installments'],
    maxLength: [3, 'Number of Installments cannot exceed 3 characters'],
    min: [1, 'Number of Installments must be a positive number']
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    required: [true, 'Please Enter Loan Status'],
  },
  installments: [
    {
      amount: {
        type: Number,
        required: [true, 'Please Enter Installment Amount'],
        maxLength: [10, 'Amount cannot exceed 10 characters'],
        min: [1, 'Amount must be a positive number']
      },
      dueDate: {
        type: Date,
        required: [true, 'Please Enter Installment Due Date'],
      },
      status: {
        type: String,
        required: [true, 'Please Enter Installment Status'],
      },
    },
  ],
});

module.exports = mongoose.model('Loan', loanSchema);
