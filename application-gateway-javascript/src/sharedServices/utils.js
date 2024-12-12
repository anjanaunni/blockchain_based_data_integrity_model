const crypto = require('crypto');

/**
 * This function generates a SHA-256 hash of the provided userr data object
 * @param {object} record - the user data object to be hashed
 * @returns {string} the SHA-256 hash of the data object in hexadecimal format
 */
function calculateHash(record) {
  const jsonString = JSON.stringify(record); 
  const hash = crypto.createHash('sha256'); 
  hash.update(jsonString);
  return hash.digest('hex');
}

/**
 * Compares the SHA-256 hashes of the two user data records to determine if they are corrupted
 * @param {object} firstRecord  - the user object from db
 * @param {object} secondRecord - the user objecct from fabric 
 * @returns {boolean} - true - if the hashes are equal, false otherwise
 */
function compareHash(firstRecord, secondRecord) {
    const firstRecordHash = calculateHash(firstRecord);
    const secondRecordHash = calculateHash(secondRecord);
    return firstRecordHash === secondRecordHash
}
/**
 * Custom error handling class
 */
class HttpException extends Error {
    constructor(status, message) {
      super(message);
      this.status = status;
      this.message = message;
    }
    toString() {
      return this.message;
    }
  }

module.exports = { calculateHash, compareHash, HttpException };
