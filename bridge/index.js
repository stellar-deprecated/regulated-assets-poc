require("dotenv").config();
const express = require("express");
const cors = require("cors");
const PORT = process.env.BRIDGE_PORT || 3000;

const app = express();
app.use(cors());

app.get("/.well-known/stellar.toml", require("./toml"));
app.get("/approve", require("./approve"));
app.get("/deposit", require("./deposit"));

app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).send({ error: err });
});

app.listen(PORT, () => {
	console.log(`Bridge listening on port ${PORT}`);
});
