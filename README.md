# Regulated Assets Proof of Concept

An express middleware adding SEP-8 compliance to your project by specifying your own ruleset.  For more information on how this works see the blog post [TBD].

## Usage

See the [example](/example/index.js) project for a full implementation that implements a simple "Transaction must be less than an amount of 50" ruleset.

```
const regulatedAssetBridge = require("regulated-assets");
const app = express();
app.use(regulatedAssetBridge(rules));
app.use(regulatedAssetBridge.toml);
app.listen(PORT);
```

The bridge can be used by providing a set of `rules`.  The rules should be an async function that takes in a [StellarSdk.Transaction](https://stellar.github.io/js-stellar-sdk/Transaction.html), and returns an object with an `allowed` boolean and optional `error` string message.  You can do whatever you need inside this rules function to validate whether the proposed transaction should be allowed, including querying the stellar ledger via horizon, external API calls to talk to another part of your service, or just a set of basic rules.

Once you return that a transaction is allowed, the bridge takes care of the rest of the communication with the new sandwiched transaction.

### Wallets

Currently there is a branch that adds support for regulated assets here: https://github.com/msfeldstein/stellar-demo-wallet/tree/AddRegAssets.  The features will be added to the main project shortly.

### Notes

Controlling Asset Holders using AUTHORIZATION_REQUIRED: https://www.stellar.org/developers/guides/concepts/assets.html#controlling-asset-holders