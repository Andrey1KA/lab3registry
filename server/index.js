const express = require("express");
const app = express();
const cors = require("cors");
const keccak256 = require("ethereum-cryptography/keccak.js").keccak256;
const secp256k1 = require("ethereum-cryptography/secp256k1").secp256k1;
const utf8ToBytes = require("ethereum-cryptography/utils").utf8ToBytes;
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "03b723407af4d614b09f0889b588547df889c43aab51f9479a2f6af12ecc982e0a": 100,
  "033d926042bbd6d017b6580bc80a0e1f45109b2ac7d606ea1a3ad76b335ecaa0ea": 50,
  "0306cafa0a659e96de6e75cc4f4b424019ff0337acbe6aee82c390c8ec8a671bed": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const transaction = req.body;
  console.log(transaction);
  const { sender, recipient, amount, hexSign } = transaction;
  const senderHash = keccak256(utf8ToBytes(`${sender}|${amount}|${recipient}`));
  const isSigned = secp256k1.verify(hexSign, senderHash, sender);
  console.log("Is signed: ", isSigned);
  if (isSigned) {
    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } else {
    res.status(400).send({ message: "Not signed!" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
