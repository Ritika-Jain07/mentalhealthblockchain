const Web3 = require("web3");
const solc = require("solc");
const fs = require("fs");

// Connect to Ganache
const web3 = new Web3("http://127.0.0.1:7545");

// Read contract
const source = fs.readFileSync("MentalHealth.sol", "utf8");

// Compile using installed solc (0.8.0)
const input = {
  language: "Solidity",
  sources: {
    "MentalHealth.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  console.log(output.errors);
}

const contractFile =
  output.contracts["MentalHealth.sol"]["MentalHealthAccess"];

const abi = contractFile.abi;
const bytecode = contractFile.evm.bytecode.object;

(async () => {
  try {
    const accounts = await web3.eth.getAccounts();

    console.log("Deploying from:", accounts[0]);

    const contract = new web3.eth.Contract(abi);

    const deployed = await contract
      .deploy({
        data: "0x" + bytecode,
      })
      .send({
        from: accounts[0],
        gas: 6000000, // 🔥 increased
      });

    console.log("✅ Contract deployed at:", deployed.options.address);

    fs.writeFileSync(
      "contract.json",
      JSON.stringify(
        {
          address: deployed.options.address,
          abi,
        },
        null,
        2
      )
    );
  } catch (err) {
    console.error("❌ Deployment failed:", err.message);
  }
})();