const e = require("express");

let streams = [];

const log = function(msg) {
  console.log(msg);
  streams.forEach(s =>
    s.write(`data: ${JSON.stringify({ message: msg })}\n\n`)
  );
};

/**
 * @param {e.Request} req
 * @param {e.Response} res
 */
const handler = async (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*"
  });
  streams.push(res);

  req.on("close", () => {
    // console.log("Closing stream");
    streams = streams.filter(s => s !== res);
    res.end();
  });
};

handler.log = log;

module.exports = handler;
