const { Router } = require('express');
//const session = require('express-session')
const webLogin = Router();

webLogin.get("/", (req, res) => {
    const title = 'Login'
    res.render('pages/login', { titulo: title })
})

webLogin.post("/", (req, res) => {
    console.log(req.body)
    console.log(req.session)

    if (req.session.usuario) { req.session.usuario = req.body }
    else { req.session.usuario = req.body }

    res.redirect('/')

})


webLogin.get('/info', (req, res) => {
    console.log('------------ req.session -------------')
    console.log(req.session)
    console.log('--------------------------------------')

    console.log('----------- req.sessionID ------------')
    console.log(req.sessionID)
    console.log('--------------------------------------')

    console.log('----------- req.cookies ------------')
    console.log(req.cookies)
    console.log('--------------------------------------')

    console.log('---------- req.sessionStore ----------')
    console.log(req.sessionStore)
    console.log('--------------------------------------')

    res.send('Send info ok!')
})

exports.webLogin = webLogin;