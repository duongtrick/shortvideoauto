import { randomInt } from "node:crypto";
import { env } from "@/lib/env";

export type BankTransaction = {
  id: string;
  amount: number;
  description: string;
  happenedAt?: string;
};

export function createPaymentCode(prefix = "CTF5") {
  return `${prefix}${randomInt(100000, 999999)}`;
}

export function findPaymentCode(description: string, prefix = "CTF5") {
  const match = description.toUpperCase().match(new RegExp(`\\b${prefix}\\d{6}\\b`));
  return match?.[0] ?? null;
}

export function matchBankTransaction(
  transaction: BankTransaction,
  payment: { code: string; amount: number; status: string }
) {
  return (
    payment.status === "pending" &&
    transaction.amount >= payment.amount &&
    findPaymentCode(transaction.description) === payment.code
  );
}

export function createBankTransferInstruction(input: { code: string; amount: number; credits: number }) {
  const content = `NAP ${input.code}`;

  return {
    bankName: env.BANK_NAME,
    accountNumber: env.BANK_ACCOUNT_NUMBER,
    accountName: env.BANK_ACCOUNT_NAME,
    amount: input.amount,
    credits: input.credits,
    content,
    qrPayload: [
      `BANK:${env.BANK_NAME}`,
      `ACCOUNT:${env.BANK_ACCOUNT_NUMBER}`,
      `NAME:${env.BANK_ACCOUNT_NAME}`,
      `AMOUNT:${input.amount}`,
      `CONTENT:${content}`
    ].join("|")
  };
}
