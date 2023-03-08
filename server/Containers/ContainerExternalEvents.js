const MercadolibreClient = require('../clients/mercadolibreClient')
const FreshdeskClient = require('../clients/freshdeskClient')

class ContainerExternalEvents {
    constructor(){
        this.clienteML = new MercadolibreClient()
        this.clientFresh = new FreshdeskClient()
    }

    async handlerTktPreVenta(event){
        const idML = Number(event.data.resource.split('/')[2])
        const allTickets = await this.clientFresh.getAllTickets()
        const ticket = allTickets.find(ticket => Number(ticket.custom_fields.cf_id_mercadolibre) === idML)
        const pregunta = await this.clienteML.getPregunta(idML)
        const item = await this.clienteML.getItem(idML)
        
        const dataTicket = {
            text: pregunta.text,
            link: item.permalink,
            title: item.title,
            pictures: item.pictures,
            price: item.price,
            initial_quantity: item.initial_quantity,
            available_quantity: item.available_quantity,
            start_time: item.start_time
        }

        if(ticket === undefined){
            await this.clientFresh.crearTicket(dataTicket, idML, pregunta.from.id)
        } else{
            console.log(`El ticket ${ticket.id} ya está creado`)
        }
    }

    async handlerTktPostVenta(event){
        const mensajePostVenta = await this.clienteML.getMensajePostVenta(event.data.resource) 
        const allTickets = await this.clientFresh.getAllTickets()
        const ticket = allTickets.find(ticket => ticket.custom_fields.cf_id_mlposventa === event.data.resource)
        const idOrden = mensajePostVenta.messages[0].message_resources[0].id
        const dataOrden = await this.clienteML.getOrdenCompra(idOrden)
        const idItem = dataOrden.order_items[0].item.id
        const dataItem = await this.clienteML.getItem(idItem)

        const dataMensajePostVenta = {
            idUsuario: mensajePostVenta.messages[0].from.user_id,
            text: mensajePostVenta.messages[0].text,
            link: dataItem.permalink,
            title: dataItem.title,
            pictures: dataItem.pictures,
            price: dataItem.price,
            initial_quantity: dataItem.initial_quantity,
            available_quantity: dataItem.available_quantity,
            start_time: dataItem.start_time
        }

        if(ticket === undefined){
            await this.clientFresh.crearTicketPostVenta(dataMensajePostVenta, event.data.resource)

        } else{
            const conversations = await this.clientFresh.getConversacionTicket(ticket.id)
            const infoTicket = await this.clientFresh.getTicket(ticket.id)
            const textsConversations = conversations.map(text => text.body_text)
            const msjUnico = infoTicket.description_text.split('Mensaje:')
            const dataMsjUnico = msjUnico[1].trim()
            textsConversations.push(infoTicket.description_text, dataMsjUnico)

            if(!textsConversations.includes(mensajePostVenta.messages[0].text.trim())){
                await this.clientFresh.responderConversacion(ticket.id, mensajePostVenta.messages[0].text)
            } else{
                console.log(`El mensaje postventa ya está en el ticket: ${ticket.id}`)
            }
        }
    }
    
    async handlerTktReclamo(event){
        const idReclamo = event.data.resource.split('/')[3]
        const mensajeReclamo = await this.clienteML.getMensajeReclamo(idReclamo)
        const ultimoReclamo = mensajeReclamo.filter(mensaje => mensaje.sender_role === 'complainant')[0]
        const allTickets = await this.clientFresh.getAllTickets()
        const ticket = allTickets.find(ticket => Number(ticket.custom_fields.cf_id_reclamoml) === Number(idReclamo))
        const detalleReclamo = await this.clienteML.getDetalleReclamo(idReclamo)
        const idUsuarioReclamo = detalleReclamo.players.find(detalle => detalle.role === "complainant").user_id
        const usuario = await this.clienteML.getUsuario(idUsuarioReclamo)
        const dataOrden = await this.clienteML.getOrdenCompra(detalleReclamo.resource_id)
        const idItem = dataOrden.order_items[0].item.id
        const dataItem = await this.clienteML.getItem(idItem)

        const dataMensajeReclamo = {
            usuario: usuario,
            text: ultimoReclamo.message,
            link: dataItem.permalink,
            title: dataItem.title,
            pictures: dataItem.pictures,
            price: dataItem.price,
            initial_quantity: dataItem.initial_quantity,
            available_quantity: dataItem.available_quantity,
            start_time: dataItem.start_time
        }

        if(ticket === undefined){
            await this.clientFresh.crearTicketReclamo(dataMensajeReclamo, idReclamo)

        } else{
            const conversations = await this.clientFresh.getConversacionTicket(ticket.id)
            const infoTicket = await this.clientFresh.getTicket(ticket.id)
            const textsConversations = conversations.map(text => text.body_text)
            const msjUnico = infoTicket.description_text.split('Reclamo:')
            const dataMsjUnico = msjUnico[1].trim()
            textsConversations.push(infoTicket.description_text, dataMsjUnico)

            if(!textsConversations.includes(ultimoReclamo.message)){
                await this.clientFresh.responderConversacion(ticket.id, ultimoReclamo.message)
            } else{
                console.log(`El reclamo ya está en el ticket: ${ticket.id}`)
            }
        }
    }

    async handlerCompra(event){
        const idCompra = event.data.resource.split('/')[2]
        const ordenCompra = await this.clienteML.getOrdenCompra(idCompra)
        const allTickets = await this.clientFresh.getAllTickets()
        const ticket = allTickets.find(ticket => Number(ticket.custom_fields.cf_id_user_preventa) === Number(ordenCompra.buyer.id) )

        if(ticket !== undefined){
            if(ordenCompra.status === 'paid'){
                if(ticket.custom_fields.cf_result_preventaml !== 'Se realizó la compra'){
                    const data = {
                        "custom_fields" : { "cf_result_preventaml": "Se realizó la compra" }
                    }
                    await this.clientFresh.responderConversacion(ticket.id, 'El usuario realizó la compra.')
                    await this.clientFresh.updateTicket(ticket.id, data)
                }
            }
    
            if(ordenCompra.status === 'cancelled'){
                if(ticket.custom_fields.cf_result_preventaml !== 'Se canceló la compra'){
                    const data ={
                        "custom_fields" : { "cf_result_preventaml": "Se canceló la compra" } 
                    }
                    await this.clientFresh.responderConversacion(ticket.id, 'El usuario canceló la compra.')
                    await this.clientFresh.updateTicket(ticket.id, data)
                }
            }
        }
    }
}

exports = ContainerExternalEvents