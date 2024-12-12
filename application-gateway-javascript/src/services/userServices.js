const User = require('../models/users');
const fabricService = require('../services/fabricService');
const { compareHash, HttpException } = require('../sharedServices/utils');

/**
 * Creates a new user in the db after checking if it already exists
 * @param {object} userData - the user data to be added to db
 * @returns {Promise<object>} - the newly added user
 */
async function createUser(userData) {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
        throw new HttpException(400, 'A user with this email already exists');
    }
    
    // Create the user
    const user = await User.create(userData);
    console.log('User saved:', user.toJSON());
    return user;
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new HttpException(400, 'Email must be unique');
    }
    throw new HttpException(400, 'Error inserting user in db');
  }
}

/**
 * This function returns the user data of the email specified if a match is found in the db
 * @param {string} email - the email of the user to be returned
 * @returns {Promise<object>} the users details if a match found
 */
async function getUser(email) {
  try {
    const user = await User.findOne({
      attributes: ['name', 'email', 'dob', 'ppsn'],
      where: { email }  });
    const fabricUser = await fabricService.getUser(email)
    if (!user.dataValues || !fabricUser) {
      throw new HttpException(404, 'User not found in PostgreSQL or Fabric');
    }
    // compare hash of user details from db and blockchain, if true then return user details
    // else throw error
    const hashCompareResult = compareHash(user.dataValues, fabricUser)
    if(hashCompareResult) {
      return user.dataValues;
    } else {
      throw new HttpException(404, 'User data is corrupted');
    }
  } catch (error) {
    if (error instanceof HttpException) {
      throw new HttpException(404, error.message);
    } else {
      throw new HttpException(404, 'Unexpected error:' + error);
    }
  }
}

module.exports = {
    createUser,
    getUser
};
