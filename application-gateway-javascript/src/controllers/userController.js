const { HttpException } = require('../sharedServices/utils');
const userService = require('../services/userServices');
const fabricController = require('../controllers/fabricController');

/**
 * Creates users
 * @param {object} req - request object with user data in body
 * @param {object} res - resonse object for sending HTTP response
 * @returns 
 */
const createUser = async (req, res) => {
  const { name, email, dob, ppsn } = req.body; // Extract data from request body

  // Basic validation
  if (!name || !email || !dob || !ppsn) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const userData = {
    name,
    email,
    dob,
    ppsn,
  };
  try {
    // Create a user using the user service and if succeeds, created the same user in fabric network
    const user = await userService.createUser(userData);
    if(user) {
      await fabricController.createFabricUser(userData);
      res.status(200).json(user);
    } else {
      throw new HttpException(400,'Error inserting user to fabric network')
    }
  } catch (error) {
    if (error instanceof HttpException) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
    }
}

/**
 * 
 * @param {object} req - request object with eamil as param
 * @param {object} res - resonse object for sending HTTP response
 */
async function getUserByEmail(req, res) {
  const { id: email } = req.params;
  try {
    const user = await userService.getUser(email);
    if(user) {
      res.status(200).json(user);
    } else {
      throw new HttpException(400,'Error retrieving user, data might be corrupted')
    }
  } catch (error) {
    if (error instanceof HttpException) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = {
  createUser,
  getUserByEmail
};