const Web3 = require("web3");
require("dotenv").config();

const contractData = require("./contract.json");

// RPC
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:7545";

const web3 = new Web3(RPC_URL);

// Use new deployed contract
const contract = new web3.eth.Contract(
  contractData.abi,
  contractData.address
);

console.log(`✅ Connected to contract at ${contractData.address} on ${RPC_URL}`);

module.exports = { web3, contract };