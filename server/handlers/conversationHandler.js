const ContainerConversation = require('../Containers/ContainerConversation')

const handlerConversation = async (event) => {
    const conversationContainer = new ContainerConversation()

    await conversationContainer.handlerRespuestaPreventa(event)
}

exports = handlerConversation