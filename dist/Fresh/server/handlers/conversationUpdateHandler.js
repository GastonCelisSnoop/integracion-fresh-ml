const ContainerConversation = require('../Containers/ContainerConversation')
const FreshdeskClient = require('../clients/freshdeskClient')

const handlerConversationUpdate = async (event) =>{
    const conversationContainer = new ContainerConversation()
    const clientFresh = new FreshdeskClient()

    const dataTicket = await clientFresh.getTicket(event.data.conversation.ticket_id)

    if(dataTicket.custom_fields.cf_id_ml_posventa && dataTicket.custom_fields.cf_id_reclamoml === null) {
        await conversationContainer.handlerRespuestaPostventa(event, dataTicket)
    }

    if(dataTicket.custom_fields.cf_id_reclamoml && dataTicket.custom_fields.cf_id_ml_posventa === null){
        await conversationContainer.handlerRespuestaReclamo(event, dataTicket)
    }
}

exports = handlerConversationUpdate