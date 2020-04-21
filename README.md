# Regulated Assets Bridge Server

An express middleware adding SEP-8 compliance to your project by specifying your own ruleset.  For more information on how this works see the blog post [TBD].

## Usage

See the [example](/example/index.js) project for a full implementation that implements a simple "Transaction must be less than an amount of 50" ruleset.

### Env file

In your `.env` file add entries for `ASSET_CODE` and `ISSUER_SECRET` so that the bridge can sign approval transactions.

### Implementation

```
const regulatedAssetBridge = require("regulated-assets");
const app = express();
app.use(regulatedAssetBridge(rules));
// Optionally add the toml handler
app.use(regulatedAssetBridge.toml);
app.listen(PORT);
```

The bridge can be used by providing a set of `rules`.  The rules should be an async function that takes in a [StellarSdk.Transaction](https://stellar.github.io/js-stellar-sdk/Transaction.html), and returns an object with an `allowed` boolean and optional `error` string message.  You can do whatever you need inside this rules function to validate whether the proposed transaction should be allowed, including querying the stellar ledger via horizon, external API calls to talk to another part of your service, or just a set of basic rules.

Once you return that a transaction is allowed, the bridge takes care of the rest of the communication with the new sandwiched transaction.

### TOML

The bridge provides an optional `toml` route handler.  If you already have a toml file for your service you can just not use the toml middleware, but make sure that your currency has the `approval_server` and `approval_criteria` added.

### Wallets

Currently there is a branch that adds support for regulated assets here: https://github.com/msfeldstein/stellar-demo-wallet/tree/AddRegAssets.  The features will be added to the main project shortly.

### Notes

Controlling Asset Holders using AUTHORIZATION_REQUIRED: https://www.stellar.org/developers/guides/concepts/assets.html#controlling-asset-holders