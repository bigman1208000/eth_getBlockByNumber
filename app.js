import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import ethers from "ethers";
import converter from "hex2dec";

const port = process.env.PORT || 3001;
const host = "0.0.0.0";
const app = express();
app.use(cors());
app.get("/", (req, res) => res.send("Test Project ..."));

app.listen(port, host, () =>
  console.log(`Listening on port http://${host}:${port}`)
);


//Input : BlockNumber
//Output : Streaming arrays of smart contracts
app.get("/:number", async (req, res) => {
  try {
    const { number } = req.params;
    if (!number) {
      res.status(404).send({ message: "Error: Missing blockNumber" });
    }
    const blockNumber = converter.decToHex(number);
    const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/90d9e5d8f24748bd8b1e1ddb1e03d9e2");
    const blockData = await provider.getBlock(blockNumber);
    const result = [];
    var promises = blockData.transactions.map((transaction, ind) => {
      var options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"jsonrpc":"2.0","method":"eth_getTransactionByHash","params":["'+ transaction +'"],"id":'+ (ind + 1) +'}'
      };
      return fetch("https://mainnet.infura.io/v3/90d9e5d8f24748bd8b1e1ddb1e03d9e2", options).then((y) => y.json());
    });

    const getTransactions = await Promise.all(promises).then((results) => {
      return Promise.resolve(results);
    });

    getTransactions.map((transaction) => {
      result.push(transaction.result.to);
    });

    res.status(200).send(result);
  } catch (error) {
    res.status(404).send(error);
  }
});