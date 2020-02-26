// Create and set up issuer account
require("dotenv").config();
const fetch = require("node-fetch");
const StellarSdk = require("stellar-sdk");

const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
const issuer = StellarSdk.Keypair.fromSecret(process.env.ISSUER_SECRET);

async function main() {
	let issuerAccountData;
	try {
		issuerAccountData = await server.loadAccount(issuer.publicKey());
		console.log(`Issuing account ${issuer.publicKey()} exists and is funded`);
	} catch (e) {
		try {
			console.log(`Friendbotting issuing account ${issuer.publicKey()}`);
			const response = await fetch(
				`https://friendbot.stellar.org?addr=${encodeURIComponent(
					issuer.publicKey()
				)}`
			);
			const responseJSON = await response.json();
			console.log("Issuing account created");
		} catch (e) {
			console.error("Error creating issuer account!", e);
		}
		issuerAccountData = await server.loadAccount(issuer.publicKey());
	}
	const feeStats = await server.feeStats();
	const fee = feeStats.fee_charged.p90;
	const authRequiredTx = new StellarSdk.TransactionBuilder(issuerAccountData, {
		fee,
		networkPassphrase: StellarSdk.Networks.TESTNET
	})
		.addOperation(
			StellarSdk.Operation.setOptions({
				setFlags: StellarSdk.AuthRequiredFlag | StellarSdk.AuthRevocableFlag
			})
		)
		.addOperation(
			StellarSdk.Operation.setOptions({
				homeDomain: process.env.HOME_DOMAIN
			})
		)
		.setTimeout(30)
		.build();
	authRequiredTx.sign(issuer);
	console.log(
		"Setting issuer account flags AUTHORIZATION_REQUIRED and AUTHORIZATION_REVOCABLE, as well as home_domain = " +
			process.env.HOME_DOMAIN
	);
	await server.submitTransaction(authRequiredTx);
}

main();
