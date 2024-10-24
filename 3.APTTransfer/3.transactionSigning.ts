import {
  Account,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
} from "@aptos-labs/ts-sdk";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const API_KEY = process.env.API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY; // 0x12345...
if (!PRIVATE_KEY || !API_KEY) throw new Error("Check your .env file");

const config = new AptosConfig({
  fullnode: `https://aptos-testnet.nodit.io/${API_KEY}/v1`,
  indexer: `https://aptos-testnet.nodit.io/${API_KEY}/v1/graphql`,
});

const aptos = new Aptos(config);
const ed25519Scheme = new Ed25519PrivateKey(PRIVATE_KEY);
const senderAccount = Account.fromPrivateKey({
  privateKey: ed25519Scheme,
});
const receiverAddress = Account.generate().accountAddress.toString();
const amount = 10_000_000;

(async () => {
  try {
    const senderAddress = senderAccount.accountAddress.toString();
    const transaction = await aptos.transaction.build.simple({
      sender: senderAddress,
      data: {
        function: "0x1::aptos_account::transfer",
        functionArguments: [receiverAddress, amount],
      },
    });

    // optional
    const [simulateTransactionResult] = await aptos.transaction.simulate.simple(
      {
        signerPublicKey: senderAccount.publicKey,
        transaction,
      }
    );

    const senderAuthenticator = aptos.transaction.sign({
      signer: senderAccount,
      transaction,
    });

    console.log(senderAuthenticator);
  } catch (error) {
    console.error(error);
  }
})();