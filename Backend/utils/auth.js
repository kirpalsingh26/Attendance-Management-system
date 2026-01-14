const jwt = require('jsonwebtoken');

// Generate JWT Token
exports.generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  const expire = process.env.JWT_EXPIRE || '7d';
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign({ id }, secret, {
    expiresIn: expire
  });
};

// Send token response
exports.sendTokenResponse = (user, statusCode, res) => {
  try {
    const token = this.generateToken(user._id);

    const options = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // 'none' for cross-origin in production
      path: '/'
    };

    // Set cookie and send response
    res.status(statusCode)
      .cookie('token', token, options)
      .json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          theme: user.theme,
          authProvider: user.authProvider
        }
      });
  } catch (error) {
    console.error('Error in sendTokenResponse:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating authentication token',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};
