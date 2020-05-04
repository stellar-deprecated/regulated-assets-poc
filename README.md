# Regulated Assets Bridge Server

An express middleware adding SEP-8 compliance to your project by specifying your own ruleset.  For more information on how this works see the blog post [TBD].

## Usage

See the [example](/example/index.js) project for a full implementation that implements a simple "Transaction must be less than an amount of 50, and accounts can hold a maximum of 1000 tokens" ruleset.

### Env Vars

Add `ASSET_CODE` and `ISSUER_SECRET` environment variables so that the bridge can sign approval transactions.
`BRIDGE_HOSTNAME` is required if you use the TOML middleware, and should contain the hostname the approval server will be located at.
`HOME_DOMAIN` is required if you want to use the included scripts to set up your issuer account.  `HOME_DOMAIN` should be where your TOML is hosted, and doesn't necessarily need to be the same domain as the bridge.

### Issuing an asset

To quickly set up an issuer account, use the `scripts/setup-issuer.js` script.  Ensure your env vars are set up and run:

`$ node scripts/setup-issuer.js`

This will set up the issuer account with the proper flags.  To actually issue an asset, use the `scripts/issue-asset-to-address.js` script.  This can be used to either issue a batch amount to a distribution account, or ad-hoc issuance to clients.

`$ node scripts/issue-asset-to-address.js <amount> <wallet address>`

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