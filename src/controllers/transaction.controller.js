
const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");


// CREATE NORMAL TRANSACTION


async function createTransaction(req, res) {

    try {

        // Validate request
        const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

        if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "fromAccount, toAccount, amount, idempotencyKey are required"
            });
        }


        // Check whether accounts exist
        const fromUserAccount = await accountModel.findOne({
            _id: fromAccount
        });

        const toUserAccount = await accountModel.findOne({
            _id: toAccount
        });

        if (!fromUserAccount || !toUserAccount) {
            return res.status(400).json({
                message: "Invalid fromAccount or toAccount"
            });
        }


        // Validate idempotency key
        const isTransactionAlreadyExists = await transactionModel.findOne({
            idempotencyKey: idempotencyKey
        });

        if (isTransactionAlreadyExists) {

            if (isTransactionAlreadyExists.status === "COMPLETED") {
                return res.status(200).json({
                    message: "Transaction already processed",
                    transaction: isTransactionAlreadyExists
                });
            }

            if (isTransactionAlreadyExists.status === "PENDING") {
                return res.status(200).json({
                    message: "Transaction is still processing"
                });
            }

            if (isTransactionAlreadyExists.status === "FAILED") {
                return res.status(500).json({
                    message: "Transaction is failed"
                });
            }

            if (isTransactionAlreadyExists.status === "REVERSED") {
                return res.status(200).json({
                    message: "Transaction is reversed"
                });
            }
        }


        // Check account status
        if (
            fromUserAccount.status !== "ACTIVE" ||
            toUserAccount.status !== "ACTIVE"
        ) {
            return res.status(400).json({
                message: "both account should be active to proceess"
            });
        }


        // Derive sender balance from ledger
        const balance = await fromUserAccount.getBalance();

        if (balance < amount) {
            return res.status(400).json({
                message: `insufficient balance.Current balance is ${balance}.requested amount is ${amount}`
            });
        }


        // Start MongoDB transaction
        const session = await mongoose.startSession();

        try {

            session.startTransaction();


            // Create transaction
            const transaction = await transactionModel.create({
                fromAccount,
                toAccount,
                amount,
                idempotencyKey,
                status: "PENDING"
            }, { session });


            // Create debit ledger entry
            const debitLedgerEntry = await ledgerModel.create({
                account: fromAccount,
                amount: amount,
                transaction: transaction._id,
                type: "DEBIT"
            }, { session });


            // Create credit ledger entry
            const creditLedgerEntry = await ledgerModel.create({
                account: toAccount,
                amount: amount,
                transaction: transaction._id,
                type: "CREDIT"
            }, { session });


            // Mark transaction as completed
            transaction.status = "COMPLETED";

            await transaction.save({ session });


            // Commit transaction
            await session.commitTransaction();


            // End session
            session.endSession();


            // Send email notification
            await emailService.sendTransactionEmail(
                req.user.email,
                req.user.name,
                amount,
                toAccount
            );


            return res.status(201).json({
                message: "Transaction completed successfully",
                transaction: transaction
            });

        } catch (error) {

            // Rollback everything if something fails
            await session.abortTransaction();

            session.endSession();

            throw error;
        }

    } catch (error) {

        console.error("Create Transaction Error:", error);

        return res.status(500).json({
            message: "Transaction failed",
            error: error.message
        });
    }
}



// =====================================================
// CREATE INITIAL FUNDS TRANSACTION
// =====================================================

async function createInitialFundsTransaction(req, res) {

    try {

        const { toAccount, amount, idempotencyKey } = req.body;


        // Validate request
        if (!toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                message: "toAccount, amount and idempotencyKey are required"
            });
        }


        // Check destination account
        const toUserAccount = await accountModel.findOne({
            _id: toAccount
        });

        if (!toUserAccount) {
            return res.status(400).json({
                message: "Invalid toAccount"
            });
        }


        // Find system user's account
        const fromUserAccount = await accountModel.findOne({
            // systemUser: true,
            user: req.user._id
        });

        if (!fromUserAccount) {
            return res.status(400).json({
                message: "System user account not found"
            });
        }


        // Start MongoDB transaction
        const session = await mongoose.startSession();

        try {

            session.startTransaction();


            // Create transaction
            const transactionResult = await transactionModel.create([{
                fromAccount: fromUserAccount._id,
                toAccount,
                amount,
                idempotencyKey,
                status: "PENDING"
            }], { session });


            // Since create() was given an array,
            // MongoDB returns an array
            const transaction = transactionResult[0];


            // Create debit ledger entry
            const debitLedgerEntry = await ledgerModel.create({
                account: fromUserAccount._id,
                amount: amount,
                transaction: transaction._id,
                type: "DEBIT"
            }, { session });


            // Wait for 100 seconds
            await (() => {
                return new Promise((resolve) =>
                    setTimeout(resolve, 100 * 1000)
                );
            })();


            // Create credit ledger entry
            const creditLedgerEntry = await ledgerModel.create({
                account: toAccount,
                amount: amount,
                transaction: transaction._id,
                type: "CREDIT"
            }, { session });


            // Mark transaction as completed
            transaction.status = "COMPLETED";

            await transaction.save({ session });


            // Commit transaction
            await session.commitTransaction();


            // End session
            session.endSession();


            return res.status(201).json({
                message: "initial funds transaction completed successfully",
                transaction: transaction
            });

        } catch (error) {

            // Rollback transaction
            await session.abortTransaction();

            session.endSession();

            throw error;
        }

    } catch (error) {

        console.error("Create Initial Funds Transaction Error:", error);

        return res.status(500).json({
            message: "Initial funds transaction failed",
            error: error.message
        });
    }
}



module.exports = {
    createTransaction,
    createInitialFundsTransaction
};
