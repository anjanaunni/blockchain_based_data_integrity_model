const path = require('node:path');

function envOrDefault(key, defaultValue) {
    return process.env[key] || defaultValue;
}

/**  
 * The basic path to certificates and keys used for the 
   hyperledger fabric network organizations.
*/
const cryptoPath = envOrDefault(
    'CRYPTO_PATH',
    path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'test-network',
        'organizations',
        'peerOrganizations',
        'org1.example.com'
    )
);

/**
 * channelName - the channel through which blockchain transactions occur
 * chaincodeName - the chaincode or smart contract deployed in the fabric network
 * mspId - the membership service provider ID for the organization
 */
const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'basic');
const mspId = envOrDefault('MSP_ID', 'Org1MSP');


// keyDirectoryPath - path to private key of User1
const keyDirectoryPath = envOrDefault(
    'KEY_DIRECTORY_PATH',
    path.resolve(
        cryptoPath,
        'users',
        'User1@org1.example.com',
        'msp',
        'keystore'
    )
);

//certDirectoryPath - path to public certificate of the User1
const certDirectoryPath = envOrDefault(
    'CERT_DIRECTORY_PATH',
    path.resolve(
        cryptoPath,
        'users',
        'User1@org1.example.com',
        'msp',
        'signcerts'
    )
);

//tlsCertPath - path to TLS certificate for peer communication
const tlsCertPath = envOrDefault(
    'TLS_CERT_PATH',
    path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt')
);

/**
 * peerEndpoint - the end point to which the peer connects
 * peerHostAlias - the hostname alias of the peer
*/
const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:7051');
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');


module.exports = {
    channelName,
    chaincodeName,
    mspId,
    cryptoPath,
    keyDirectoryPath,
    certDirectoryPath,
    tlsCertPath,
    peerEndpoint,
    peerHostAlias
};
