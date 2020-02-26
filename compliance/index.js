require("dotenv").config();
const express = require("express");

const PORT = process.env.COMPLIANCE_PORT || 3001;

const app = express();

app.get("/approve", require("./approve"));

app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500).send({ error: err });
});

app.listen(PORT, () => {
	console.log(`Compliance Service listening on port ${PORT}`);
});
