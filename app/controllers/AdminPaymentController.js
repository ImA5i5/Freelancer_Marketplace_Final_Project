// app/controllers/AdminPaymentController.js
const WalletService = require("../services/WalletService");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const EmailService = require("../services/email.service");

class AdminPaymentController {
 // =============================
// ✅ Admin — AJAX Paginated Transactions
// =============================
static async allTransactions(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Count total
    const total = await Transaction.countDocuments();

    // Fetch paginated transactions
    const transactions = await Transaction.find()
      .populate("freelancer client milestone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // If AJAX request → return HTML only
    if (req.xhr) {
      return res.render(
        "pages/admin/partials/transactions-table",
        { transactions, pagination: {
            page,
            totalPages: Math.ceil(total / limit)
          }
        },
        (err, html) => {
          res.send({ html });
        }
      );
    }

    // Normal full-page render
    res.render("pages/admin/payments", {
      layout: "layouts/admin-layout",
      transactions,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.log(err);
    return res.status(500).send("Server Error");
  }
}


  // ✅ Admin: payout to freelancer
  static async payout(req, res) {
  try {
    const { freelancerId, amount } = req.body;

    await WalletService.debit(
      freelancerId,
      amount,
      "Admin Payout Processed"
    );

    const freelancer = await User.findById(freelancerId);

    EmailService.sendNotification(
      freelancer.email,
      "💸 Payout Completed",
      `A payout of ₹${amount} has been processed.`
    );

    res.json({ success: true, message: "Payout processed" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}


  // ✅ Admin: view all projects + statuses
  static async projectMonitor(req, res) {
    res.render("pages/admin/project-monitor", {
      layout: "layouts/admin-layout"
    });
  }
}

module.exports = AdminPaymentController;
