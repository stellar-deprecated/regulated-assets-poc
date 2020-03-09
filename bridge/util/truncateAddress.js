module.exports = function truncateAddress(addr) {
  return addr.substring(0, 5) + "..." + addr.substring(51, 56);
};
