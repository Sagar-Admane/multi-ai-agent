import Expense from "../models/expenseModel.js"
import { Document } from "mongoose";

interface ExpenseDoc extends Document{
    type: string;
    amount: number;
    date?: NativeDate | null | undefined;
    merchant?: string | null | undefined;
    bankName?: string | null | undefined;
}

export default function cleanJSON(str : string | any) {
    return str
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/\n/g, "")
        .replace(/\r/g, "")
        .trim();
}

export function convertToText(expenses : ExpenseDoc[]){

    const result = expenses.map((m) => {
        const amount = m.amount;
        const type = m.type;
        const bankName = m.bankName
        return `The amount was ${type} by ${amount} in the bank :- ${bankName}`;
    })
    return result;
}