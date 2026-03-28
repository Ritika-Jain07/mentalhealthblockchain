const { web3, contract } = require("./web3");

(async () => {
  try {
    const accounts = await web3.eth.getAccounts();

    console.log("Using account:", accounts[0]);

    await contract.methods
      .grantAccess(accounts[0])
      .send({ from: accounts[0] });

    console.log("✅ Access granted successfully!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
})();