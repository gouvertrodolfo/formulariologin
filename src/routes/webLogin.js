const { Router } = require('express');
const webLogin = Router();


const ContenedorUsuarios = require('../daos/ContenedorUsuarios')
const usuariosBD = new ContenedorUsuarios()


webLogin.get("/", (req, res) => {
    const title = 'Login'
    console.log(req.session.user)
    res.render('pages/login', { titulo: title })
})

webLogin.post("/", async (req, res) => {
    const { usuario: correo, clave } = req.body
    
    console.log(correo, clave)
    const [user] = await usuariosBD.listarPorCorreo(correo)

    console.log('user', user)
    if(user)
    {
        console.log('user encontrado')
        console.log(user.clave, clave)
        if(user.clave == clave){
            console.log('eureka')
            req.session.user = user
        }
    }

    res.redirect('/')

})

webLogin.get("/registro", (req, res) => {
    res.render('pages/registro')
})

webLogin.post("/registro", (req, res) => {

    let usuario = req.body

    usuariosBD.guardar(usuario)

    res.redirect('/')

})


exports.webLogin = webLogin;