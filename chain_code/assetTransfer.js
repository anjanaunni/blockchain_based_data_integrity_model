'use strict';

const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {
    
    // Initialize the chaincode
    async initLedger(ctx) {
        console.info('Initializing the ledger');
        
        return;
    }

    // Create a new user or update an existing user by email
    async createOrUpdateUser(ctx, email, name, dob, ppsn) {
        console.info(`Creating/updating user with email: ${email}`);

        // Check if the user already exists
        const userAsBytes = await ctx.stub.getState(email);
        if (userAsBytes && userAsBytes.length > 0) {
            throw new Error(`User with email ${email} already exists`);
        }

        // Construct the user data
        const user = {
            name: name,
            email: email,
            dob: dob,
            ppsn: ppsn
        };

        // Store the user in the ledger
        await ctx.stub.putState(email, Buffer.from(JSON.stringify(user)));
        console.info(`User with email ${email} has been created/updated`);
    }

    // Retrieve user details by email
    async getUser(ctx, email) {
        console.info(`Fetching user with email: ${email}`);

        // Retrieve user data from the ledger using email as the key
        const userAsBytes = await ctx.stub.getState(email);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User with email ${email} does not exist`);
        }

        // Convert the data from byte array to JSON object and return
        const user = JSON.parse(userAsBytes.toString());
        return JSON.stringify(user);
    }

    // Delete a user by email
    async deleteUser(ctx, email) {
        console.info(`Deleting user with email: ${email}`);

        // Retrieve the user to ensure it exists
        const userAsBytes = await ctx.stub.getState(email);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User with email ${email} does not exist`);
        }

        // Delete the user from the ledger
        await ctx.stub.deleteState(email);
        console.info(`User with email ${email} has been deleted successfully`);
    }
}

module.exports = AssetTransfer;

