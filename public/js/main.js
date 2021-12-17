
const socket = io.connect();



function addMessage(e) {

    console.log(session.user)
    
    const mensaje = {
        author: session.user,
        text: document.getElementById('texto').value
    };
    document.getElementById('texto').value = ''
    socket.emit('nuevoMensaje', mensaje);
    return false;
}

function addProducto(prd) {
    const nuevoPrd = {
        title: document.getElementById('title').value,
        price: document.getElementById('price').value,
        thumbnail: document.getElementById('thumbnail').value
    }
    socket.emit('nuevoProducto', nuevoPrd)
    return false;
}

socket.on('mensajes', async msjs => {
/*********************************************************************************** */
const schema = normalizr.schema;
const author_schema = new schema.Entity('author',{},{idAttribute:'correo'});

// Definimos un esquema de mensaje
const mensaje_schema = new schema.Entity('mensaje', {
    author: author_schema
  },{idAttribute:'_id'});

// Definimos un esquema de mensaje
const mensajes_schema = new schema.Array(mensaje_schema);

/*********************************************************************************** */


    const mensajes = normalizr.denormalize(msjs.result, mensajes_schema, msjs.entities)

    const plantilla = await buscarPlantillaMensajes()
    const html = armarHTML(plantilla, mensajes)
    document.getElementById('messages').innerHTML = html;
});

socket.on('productos', async arrayProductos => {
    const plantilla = await buscarPlantillaProductos()
    const html = armarHTML(plantilla, arrayProductos)
    document.getElementById('grillaProductos').innerHTML = html

})

function buscarPlantillaProductos() {
    return fetch('/plantillas/ListadoProductos.ejs')
        .then(respuesta => respuesta.text())
}

function buscarPlantillaMensajes() {
    return fetch('/plantillas/mensaje.ejs')
        .then(respuesta => respuesta.text())
}

function armarHTML(plantilla, data) {
    const render = ejs.compile(plantilla);
    const html = render({ data })
    return html
}

async function cargarProductosFake() {

    const [plantilla, arrayProductos] = await Promise.all([buscarPlantillaProductos(), buscarProductosFake()])

    const html = armarHTML(plantilla, arrayProductos)
    document.getElementById('grillaProductos').innerHTML = html

}

function buscarProductosFake() {
    return fetch('/api/productosTest/')
        .then(response => response.json())
}
