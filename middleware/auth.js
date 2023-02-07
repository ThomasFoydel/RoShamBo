const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token')
  if (!token) return res.status(401).json({ msg: 'Authorization denied' })

  try {
    const decoded = jwt.verify(token, process.env.SECRET)
    req.tokenUser = decoded.tokenUser
    if (+decoded.exp <= Date.now()) throw new Error('TokenExpiredError')
    next()
  } catch (err) {
    if (err.message === 'TokenExpiredError') return res.status(401).send({ msg: 'token expired' })
    return res.status(401).json({ msg: 'Authorizaton denied' })
  }
}
