// Deposit regulated assets into account
const fetch = require("node-fetch");
const StellarSdk = require("stellar-sdk");

const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
const issuer = StellarSdk.Keypair.fromSecret(process.env.ISSUER_SECRET);
const assetCode = process.env.ASSET_CODE;

module.exports = async function(req, res, next) {
	const { amount, address: destination } = req.query;
	console.log(
		`Depositing ${amount} ${assetCode}:${issuer.publicKey()} to ${destination}`
	);

	try {
		StellarSdk.Keypair.fromPublicKey(req.query.address);
	} catch (e) {
		return next("No destination address");
	}
	try {
		const asset = new StellarSdk.Asset(assetCode, issuer.publicKey());
		const issuerAccountData = await server.loadAccount(issuer.publicKey());
		const feeStats = await server.feeStats();
		const fee = feeStats.fee_charged.p90;
		const tx = new StellarSdk.TransactionBuilder(issuerAccountData, {
			fee,
			networkPassphrase: StellarSdk.Networks.TESTNET
		})
			.addOperation(
				StellarSdk.Operation.allowTrust({
					trustor: destination,
					authorize: true,
					assetCode
				})
			)
			.addOperation(
				StellarSdk.Operation.payment({
					amount,
					destination,
					asset
				})
			)
			.addOperation(
				StellarSdk.Operation.allowTrust({
					trustor: destination,
					authorize: false,
					assetCode
				})
			)
			.setTimeout(30)
			.build();
		tx.sign(issuer);
		console.log("Sending payment...");
		await server.submitTransaction(tx);
		res.send(200);
	} catch (e) {
		console.error(e);
		console.error(
			"Something went wrong...",
			e.response.data.extras.result_codes
		);
		return next(e.response.data.extras.result_codes);
	}
};
