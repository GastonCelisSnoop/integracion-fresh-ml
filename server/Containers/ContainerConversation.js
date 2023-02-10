const FreshdeskClient = require('../clients/freshdeskClient')
const MercadolibreClient = require('../clients/mercadolibreClient')

class ContainerConversation{
    constructor(){
        this.clienteML = new MercadolibreClient()
        this.clientFresh = new FreshdeskClient()
    }

    async handlerRespuestaPreventa(event){
        const dataTicket = await this.clientFresh.getTicket(event.data.conversation.ticket_id)
        
        await this.clienteML.responderPregunta(dataTicket.custom_fields.cf_id_mercadolibre, event.data.conversation.body_text)
    }

    async handlerRespuestaPostventa(event, dataTicket){
        const mensajePostventa = await this.clienteML.getMensajePostVenta(dataTicket.custom_fields.cf_id_ml_posventa)
        const orden = mensajePostventa.messages[0].message_resources.find(resource => resource.name === "packs")
        const idComprador = mensajePostventa.messages[0].from.user_id
        const idVendedor = mensajePostventa.messages[0].to.user_id

        await this.clienteML.responerMensajePostVenta(orden.id, idVendedor, idComprador, event.data.conversation.body_text)
    }

    async handlerRespuestaReclamo(event, dataTicket){
        await this.clienteML.responderMensajeReclamo(dataTicket.custom_fields.cf_id_reclamoml, event.data.conversation.body_text)
    }

    async getTipoDeMensaje(event){
        const dataTicket = await this.clientFresh.getTicket(event.data.conversation.ticket_id)

        if(dataTicket.custom_fields.cf_id_ml_posventa){
            console.log('El mensaje de Freshdesk es de POSTVENTA')
            return 'postventa'
        }

        if(dataTicket.custom_fields.cf_id_mercadolibre){
            console.log('El mensaje de Freshdesk es de PREVENTA')
            return 'preventa'
        }
    }
}

exports = ContainerConversation