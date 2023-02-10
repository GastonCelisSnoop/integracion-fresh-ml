const ContainerExternalEvents = require('../Containers/ContainerExternalEvents')

const handleExternalEvent = async (event) => {
    const externalEvents = new ContainerExternalEvents()
    console.log(event)
    switch (event.data.topic) {
        case 'questions':
            await externalEvents.handlerTktPreVenta(event)
            break;
        case 'messages':
            await externalEvents.handlerTktPostVenta(event)
            break;
        case 'claims':
            await externalEvents.handlerTktReclamo(event)
            break;
        case 'orders_v2':
            await externalEvents.handlerCompra(event)
            break;
    }
};

exports = handleExternalEvent
