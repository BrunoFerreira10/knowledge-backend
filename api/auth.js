const {authSecret} = require('../env-select.js')
const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const signin = async (req, res) => {
        if (!req.body.email || !req.body.password) {
            return res.status(400).send('Enter email and password!')
        }

        const user = await app.db('users')
            .where({email: req.body.email})
            .first()
        
        if (!user)
            return res.status(400).send('Email not found!')
        
            const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        if(!regexEmail.test(req.body.email))
            return res.status(400).send('Invalid email format!')

        const isMatch = bcrypt.compareSync(req.body.password, user.password)
        if(!isMatch)
            return res.status(400).send('Password do not match!')

        const now = Math.floor(Date.now() / 1000)

        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            admin: user.admin,
            iat: now, // Issued at
            //exp: now + 10
            exp: now + (60 * 60 * 24 * 3)
        }

        res.json({
            ...payload,
            token: jwt.encode(payload, authSecret)
        })
    }

    const validateToken = async (req, res) => {
        const userData = req.body || null
        try {
            if(userData) {
                const token = jwt.decode(userData.token, authSecret)
                if(new Date(token.exp * 1000) > new Date()) {
                    return res.send(true)
                } 
            }
        } catch (error) {
            // Token problem
            res.send(false)
        }
    }

    return {
        signin, 
        validateToken
    }
}