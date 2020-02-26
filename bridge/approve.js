const fetch = require("node-fetch");
const StellarSdk = require("stellar-sdk");

const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
const issuer = StellarSdk.Keypair.fromSecret(process.env.ISSUER_SECRET);

module.exports = async function(req, res, next) {
	console.log(req.query.tx);
	const envelope = StellarSdk.xdr.TransactionEnvelope.fromXDR(
		req.query.tx,
		"base64"
	);
	const tx = new StellarSdk.Transaction(envelope, StellarSdk.Networks.TESTNET);
	let totalAmount = 0;
	let assetsToParticipantMap = {};

	tx.operations.forEach(operation => {
		console.log("Type: " + operation.type);
		console.log("Source: " + operation.source);
		console.log("Destination: " + operation.destination);
		console.log("Asset: " + operation.asset.getCode());
		console.log("Amount: " + operation.amount);
		if (operation.type === "payment") {
			const code = operation.asset.getCode();
			assetsToParticipantMap[code] = assetsToParticipantMap[code] || new Set();
			totalAmount += parseFloat(operation.amount);
			assetsToParticipantMap[code].add(operation.source || tx.source);
			assetsToParticipantMap[code].add(operation.destination);
		}
	});
	console.log("Total Amount: " + totalAmount);
	if (totalAmount > 50) {
		res.send({
			status: "rejected",
			error: "Amount over 50 REG limit"
		});
	} else {
		const [sourceAccount, feeStats] = await Promise.all([
			server.loadAccount(tx.source),
			server.feeStats()
		]);
		const sandwichTxBuilder = new StellarSdk.TransactionBuilder(sourceAccount, {
			fee: feeStats.fee_charged.p90,
			networkPassphrase: StellarSdk.Networks.TESTNET
		});

		const setParticipantAuthorizations = allow => {
			Object.keys(assetsToParticipantMap).forEach(asset => {
				const participants = assetsToParticipantMap[asset];
				participants.forEach(participantAddress => {
					console.log(
						`${
							allow ? "Allowing" : "Revoking"
						} asset ${asset} for participant ${participantAddress}`
					);
					sandwichTxBuilder.addOperation(
						StellarSdk.Operation.allowTrust({
							trustor: participantAddress,
							assetCode: asset,
							authorize: allow,
							source: issuer.publicKey()
						})
					);
				});
			});
		};

		setParticipantAuthorizations(true);
		envelope
			.tx()
			.operations()
			.forEach(op => sandwichTxBuilder.addOperation(op));
		setParticipantAuthorizations(false);
		sandwichTxBuilder.setTimeout(30);
		const revisedTx = sandwichTxBuilder.build();
		revisedTx.sign(issuer);
		res.send({
			status: "revised",
			tx: revisedTx
				.toEnvelope()
				.toXDR()
				.toString("base64")
		});
	}
};
