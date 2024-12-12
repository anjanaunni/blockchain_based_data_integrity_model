const grpc = require('@grpc/grpc-js');
const { connect, hash, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { TextDecoder } = require('node:util');
const config = require('../config/fabricConfig');

const utf8Decoder = new TextDecoder();

/**
 * This function establishes a gRPC connection with hyperledger fabric peer
 * @returns {Promise<grpc.Client>} client instance
 */
async function newGrpcConnection() {
    const tlsRootCert = await fs.readFile(config.tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(config.peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': config.peerHostAlias,
    });
}

/**
 * This function creates an identity object for the user 
 * @returns {Promise<object>} an object with mspID and credentials
 */
async function newIdentity() {
    const certPath = await getFirstDirFileName(config.certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return { mspId: config.mspId, credentials };
}

/**
 * This function creates a signer instance from the private key
 * @returns {Promise<signers.PrivateKeySigner>} a private key signer
 */
async function newSigner() {
    const keyPath = await getFirstDirFileName(config.keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

/**
 * This function returns the name of the first file found in the given folder path
 * @param {string} dirPath - the path to get files  
 * @returns {Promise<string>} - path of first fie
 */
async function getFirstDirFileName(dirPath) {
    const files = await fs.readdir(dirPath);
    const file = files[0];
    if (!file) throw new Error(`No files in directory: ${dirPath}`);
    return path.join(dirPath, file);
}

/**
 * This fucntion initializes the hyperledger by trying a transaction
 * @param {object} contract - the hyperledger fabric contract instance
 */
async function initLedger(contract) {
    await contract.submitTransaction('initLedger');
    console.log('Ledger initialized.');
}

/**
 * This function establishes connection with fabric contract to perform further operations
 * @returns {Promise<object>} an object with contract, gateway and client instances
 */
async function executeFabricOperations() {

    const client = await newGrpcConnection();
    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        hash: hash.sha256,
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    });

    try {
        const network = gateway.getNetwork(config.channelName);
        const contract = network.getContract(config.chaincodeName);
        return { contract, gateway, client };
    } catch (err) {
        console.error(err);
        console.error('Fabric operation failed');
        gateway.close();
        client.close();
    }
}

/**
 * Creates a user in the fabric ledger
 * @param {object} userDetals - user data to be created in fabric
 */
async function createOrUpdateUser(userDetals) {
    // connect and retrieve fabric contract
    const { contract, gateway, client } = await executeFabricOperations()
    try {
        await contract.submitTransaction('createOrUpdateUser', userDetals.email, userDetals.name, userDetals.dob, userDetals.ppsn);
        console.log('User created/updated.');
        return { success: true, message: 'User created/updated successfully' };

    } catch (err) {
        console.error('Failed to create/update user:', err);
        const errorMessage = err.message || 'An unexpected error occurred.';
        return { success: false, error: errorMessage };
    } finally {
        gateway.close();
        client.close();
    }
}

/**
 * This function returns the user details of the specified email from the fabric ledger 
 * @param {string} email - email of the user whose data to be retrievd 
 * @returns {Promise<Object>} user details 
 */
async function getUser(email) {
    // connect and retrieve fabric contract
    const { contract, gateway, client } = await executeFabricOperations()
    try {
        const resultBytes = await contract.evaluateTransaction('getUser', email);
        const resultJson = utf8Decoder.decode(resultBytes);
        return JSON.parse(resultJson);
    } catch (err) {
        // console.error('Failed to get user:', err);
        // const errorMessage = err.message || 'An unexpected error occurred.';
        if (err.code === 2 && err.details.includes('chaincode response 500')) {
            return { success: false, error: `User with email ${email} does not exist in Fabric` };
        }
        
        // Handle other unexpected errors
        const errorMessage = err.message || 'An unexpected error occurred while querying Fabric.';
        return { success: false, error: errorMessage };
    } finally {
        gateway.close();
        client.close();
    }
}

module.exports = {
    newGrpcConnection,
    newIdentity,
    newSigner,
    initLedger,
    createOrUpdateUser,
    getUser,
    executeFabricOperations
};
