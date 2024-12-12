const fabricService = require('../services/fabricService');

/**
 * This function executes hyperledger fabric related operations
 * @param {object} userData - the sensitive info of users for performing operations
 */
async function executeFabricOperations(userData) {
    await fabricService.executeFabricOperations(userData);
}

/**
 * Creates a user in fabric netwok
 * @param {object} userData - data of user added
 */
async function createFabricUser(userData) {
    const result = await fabricService.createOrUpdateUser(userData);
    if (!result.success) {
        console.log('Error:', result.error);
    } else {
        console.log(result.message);
    }
}

/**
 * To retrieve user data stored in the fabric network using email
 * @param {string} email 
 */
async function getFabricUserByEmail(email) {
    const result = await fabricService.getUser(email);
    if (!result.success) {
        console.log('Error:', result.error);
    } else {
        console.log(result.message);
    }
}

module.exports = { createFabricUser, getFabricUserByEmail, executeFabricOperations };
