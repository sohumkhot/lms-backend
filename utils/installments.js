exports.generateInstallments = (loanAmount, numberOfWeeklyInstallments) => {
  const installments = [];

  // Calculate the weekly installment amount
  const weeklyInstallmentAmount = loanAmount / numberOfWeeklyInstallments;

  // Get the current date
  const currentDate = new Date();

  for (let i = 1; i <= numberOfWeeklyInstallments; i++) {
    // Calculate the due date by adding 7 days to the current date
    const dueDate = new Date(
      currentDate.getTime() + i * 7 * 24 * 60 * 60 * 1000
    );

    // Create the installment object
    const installment = {
      dueDate,
      amount: weeklyInstallmentAmount.toFixed(2), // Keep the amount rounded to two decimal places
      status: "pending",
    };

    installments.push(installment);
  }

  return installments;
};
