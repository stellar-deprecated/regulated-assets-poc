const StellarSdk = require("stellar-sdk");

module.exports = (req, res) => {
	const issuer = StellarSdk.Keypair.fromSecret(process.env.ISSUER_SECRET);
	const assetCode = process.env.ASSET_CODE;

	const toml = `NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

[DOCUMENTATION]
ORG_NAME="Regulated Assets Incorporated"
ORG_DBA="RAI"
ORG_URL="https://www.regulatedassetsincorporated.com"

[[CURRENCIES]]
code="${assetCode}"
issuer="${issuer.publicKey()}"
regulated=true
approval_server="${process.env.BRIDGE_HOSTNAME}/approve"
approval_criteria="Can only send 50 units at a time"`;
	res.type("text/plain").send(toml);
};
