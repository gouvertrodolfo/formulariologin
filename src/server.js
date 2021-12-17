const express = require('express')
const session = require('express-session')

/**************************************************************************************** */
const { apiProductos } = require("./routes/apiProductos")
const { apiProductosTest } = require("./routes/apiProductosTest")
const { webProductos } = require("./routes/webProductos")
const { webProductosTest } = require("./routes/webProductosTest")
const { webLogin } = require("./routes/webLogin")

/**************************************************************************************** */
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')
/**************************************************************************************** */

const Contenedor = require('./daos/ContenedorProductos')
const inventario = new Contenedor('productos.txt')


/**************************************************************************************** */
const Chat = require('./daos/ContenedorMensajes')

const chat = new Chat();

/**************************************************************************************** */

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

app.use(express.static('public'))

//Configuracion del motor de vistas que se usara
app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//espacio de rutas
app.use('/api/productos', apiProductos)
app.use('/api/productosTest', apiProductosTest)

app.use('/', webProductos)
app.use('/test', webProductosTest)

/**************************************************************************************** */
const MongoStore = require('connect-mongo')
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }

app.use(session({
    /* ----------------------------------------------------- */
    /*           Persistencia por mongo altlas database             */
    /* ----------------------------------------------------- */
    store: MongoStore.create({
        //En Atlas connect App :  Make sure to change the node version to 2.2.12:
        mongoUrl: 'mongodb://user:us3r@cluster0-shard-00-00.3svtz.mongodb.net:27017,cluster0-shard-00-01.3svtz.mongodb.net:27017,cluster0-shard-00-02.3svtz.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-3m6b86-shard-0&authSource=admin&retryWrites=true&w=majority',
        mongoOptions: advancedOptions
    }),
    /* ----------------------------------------------------- */

    secret: 'shhhhhhhhhhhhhhhhhhhhh',
    resave: false,
    saveUninitialized: false ,
    cookie: {
        maxAge: 40000
    } 
}))

app.use('/login', webLogin)

/**************************************************************************************** */

const normalizr = require("normalizr")
// const normalize = normalizer.normalize;
const schema = normalizr.schema;

// Definimos un esquema author
const author_schema = new schema.Entity('author',{},{idAttribute:'correo'});

// Definimos un esquema de mensaje
const mensaje_schema = new schema.Entity('mensaje', {
    author: author_schema
  },{idAttribute:'_id'});

// Definimos un esquema de mensaje
const mensajes_schema = new schema.Array(mensaje_schema);

/**************************************************************************************** */

io.on('connection', async socket => {

    console.log('Nuevo cliente conectado!')

    let mensajes = await chat.getAll();    

    const mensajes_normal = normalizr.normalize(mensajes, mensajes_schema)

    /* Envio los mensajes al cliente que se conectó */
    socket.emit('mensajes', mensajes_normal)

    let productos = await inventario.init();
    socket.emit('productos', productos)

    /* Escucho los mensajes enviado por el cliente y se los propago a todos */
    socket.on('nuevoMensaje', async data => {
        
        mensajes = await chat.AddMensaje(data)
        io.sockets.emit('mensajes',  mensajes)
    })

    /* Escucho los nuevos productos enviado por el cliente y se los propago a todos */
    socket.on('nuevoProducto', async prd => {

        await inventario.save(prd)
        productos = inventario.getAll();
        io.sockets.emit('productos', productos)

    })

})

/**************************************************************************************** */
const PORT = 8080
const connectedServer = httpServer.listen(PORT, function () {
    console.log(`Servidor Http con Websockets escuchando en el puerto ${connectedServer.address().port}`)
})
connectedServer.on('error', error => console.log(`Error en servidor ${error}`))
