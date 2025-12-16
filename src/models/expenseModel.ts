import mongoose from "mongoose"

const expenseSchema = new mongoose.Schema({
  amount : {
    type : Number,
    required : true
  },
  type : {
    type : String,
    default : "debited",
    required : true
  },
  date : {
    type : Date,
  },
  merchant : {
    type : String
  },
  bankName : {
    type : String
  },
}, {
    timestamps : true
})

const expenseModel = mongoose.model("Expense", expenseSchema);

export default expenseModel;