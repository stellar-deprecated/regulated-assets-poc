# Regulated Assets Proof of Concept

This is a proof of concept demo for showing how to use SEP-8 to control regulated assets on the stellar network.  Technical description can be found here: https://docs.google.com/document/d/1sZjJBYZSGhD-iGds0fKKYDoDuOsSpoFnPlrERarQPlY/edit

An extremely hacked up stellar wallet that integrates with this can be found at this branch: https://github.com/msfeldstein/stellar-demo-wallet/tree/AddRegAssets


### Notes

Controlling Asset Holders using AUTHORIZATION_REQUIRED: https://www.stellar.org/developers/guides/concepts/assets.html#controlling-asset-holders

We need to add a way (to the SEP) for wallets to check status of revocation since they'll hold tokens but should show ahead of time if they've been clawed back