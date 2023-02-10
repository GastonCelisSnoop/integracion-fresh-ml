const MercadolibreClient = require('./mercadolibreClient')
const axios = require('axios');
const { format } = require('date-fns');
const { toBase64 } = require('../utils/toBase64');


class FreshdeskClient {
    constructor() {
        this.clienteML = new MercadolibreClient()
        this.authFresh = toBase64()
    }

    async crearTicket(dataTicket, idML, usuarioId) {
        const usuario = await this.clienteML.getUsuario(usuarioId)

        const options = {
            method: 'POST',
            url: 'https://snoopcx.freshdesk.com/api/v2/tickets',
            headers: {
                cookie: '_x_w=41; _x_m=x_c',
                'Content-Type': 'application/json',
                Authorization: `Basic ${this.authFresh}`
            },
            data: {
                description: `
                <h2 style="font-weight: bold; margin-bottom: 35px;">Pregunta: ${dataTicket.text}</h2>

                <div style="width: max-content; padding: 10px; background-color: rgb(231 231 231); margin-bottom: 20px; border: solid 1px rgb(231 231 231); border-radius: 5px;">
                    <h3 style="margin-top: 0px">${dataTicket.title}</h3>

                    <div style="margin-top: 15px; margin-bottom: 20px; width: 100%">
                        ${dataTicket.pictures.map(img => `
                            <img style="width: 150px; height: 150px;" src=${img.secure_url}>
                        `)}
                    </div>

                    <p>Precio: $ ${dataTicket.price}</p>
                    <p style="margin-top: 5px;">Cantidad Inicial: ${dataTicket.initial_quantity}</p>
                    <p style="margin-top: 5px;">Cantidad Disponible: ${dataTicket.available_quantity}</p>
                    <p style="margin-top: 5px;">Inicio de la publicación: ${format(new Date(dataTicket.start_time), 'dd-MM-yyyy')}</p>
                </div>

                <p style="margin-top: 25px;">Link de la publicación: <a href="${dataTicket.link}">${dataTicket.link}</a></p>
                `,
                subject: 'Nuevo Ticket de Pregunta de Preventa ML',
                name: usuario.nickname,
                email: `${usuario.nickname.replace(/\s+/g, '')}@snoopfreshml.com`,
                type: "ML-Preventa",
                priority: 1,
                status: 2,
                custom_fields: {
                    "cf_id_mercadolibre": idML,
                    "cf_id_user_preventa": Number(usuario.id),
                    "cf_result_preventaml": "Solo consulta"
                }
            }
        };

        await axios.request(options)
            .then(response => {
                console.log(`ID del TKT: ${response.data.id}`)
                console.log("Se generó el TKT preventa correctamente");
            })
            .catch(error => {
                console.log("Error al generar el TKT preventa")
                console.error(error.response.data);
            });
    }

    async crearTicketPostVenta(dataMensajePostVenta, idMensaje) {
        const usuario = await this.clienteML.getUsuario(dataMensajePostVenta.messages[0].from.user_id)

        const options = {
            method: 'POST',
            url: 'https://snoopcx.freshdesk.com/api/v2/tickets',
            headers: {
                cookie: '_x_w=41; _x_m=x_c',
                'Content-Type': 'application/json',
                Authorization: `Basic ${this.authFresh}`
            },
            data: {
                description: dataMensajePostVenta.messages[0].text,
                subject: 'Nuevo Ticket Pregunta Postventa ML',
                name: usuario.nickname,
                email: `${usuario.nickname}@snoopfreshml.com`,
                type: "ML-Postventa",
                priority: 1,
                status: 2,
                custom_fields: {
                    "cf_id_ml_posventa": idMensaje
                }
            }
        };

        await axios.request(options)
            .then(response => {
                console.log(`ID del TKT: ${response.data.id}`)
                console.log("Se generó el TKT postventa correctamente");
            })
            .catch(error => {
                console.log("Error al generar el TKT postventa")
                console.error(error.response.data);
            });
    }

    async crearTicketReclamo(dataMensajeReclamo, idReclamo) {
        const detalleReclamo = await this.clienteML.getDetalleReclamo(idReclamo)
        const idUsuarioReclamo = detalleReclamo.players.find(detalle => detalle.role === "complainant").user_id
        const usuario = await this.clienteML.getUsuario(idUsuarioReclamo)

        const options = {
            method: 'POST',
            url: 'https://snoopcx.freshdesk.com/api/v2/tickets',
            headers: {
                cookie: '_x_w=41; _x_m=x_c',
                'Content-Type': 'application/json',
                Authorization: `Basic ${this.authFresh}`
            },
            data: {
                description: dataMensajeReclamo,
                subject: 'Nuevo Ticket Reclamo Postventa ML',
                name: usuario.nickname,
                email: `${usuario.nickname}@snoopfreshml.com`,
                type: "ML-Postventa",
                priority: 1,
                status: 2,
                custom_fields: {
                    "cf_id_reclamoml": Number(idReclamo)
                }
            }
        };

        await axios.request(options)
            .then(response => {
                console.log(`ID del TKT de reclamo: ${response.data.id}`)
                console.log("Se generó el TKT reclamo de postventa correctamente");
            })
            .catch(error => {
                console.log("Error al generar el TKT reclamo de postventa")
                console.error(error.response.data);
            });
    }

    async getAllTickets() {
        const options = {
            method: 'GET',
            url: 'https://snoopcx.freshdesk.com/api/v2/tickets',
            headers: {
                cookie: '_x_w=41; _x_m=x_c',
                Authorization: `Basic ${this.authFresh}`
            }
        };

        const tickets = await axios.request(options)
            .then(response => {
                console.log('Obteniendo todos los tickets');
                return response.data;
            }).catch(error => {
                console.log('Error al obtener todos los tickets')
                console.error(error.response.data);
            });

        return tickets
    }

    async getTicket(ticket_id) {
        const options = {
            method: 'GET',
            url: `https://snoopcx.freshdesk.com/api/v2/tickets/${ticket_id}`,
            headers: {
                cookie: '_x_w=41; _x_m=x_c',
                Authorization: `Basic ${this.authFresh}`
            }
        };

        const ticket = await axios.request(options)
            .then(response => {
                console.log(`Obteniendo el ticket ${ticket_id}`)
                return response.data;
            }).catch(error => {
                console.log('Error al obtener ticket')
                console.error(error.response.data);
            });

        return ticket
    }

    async getConversacionTicket(ticket_id) {
        const options = {
            method: 'GET',
            url: `https://snoopcx.freshdesk.com/api/v2/tickets/${ticket_id}/conversations`,
            headers: {
                cookie: '_x_w=41; _x_m=x_c',
                Authorization: `Basic ${this.authFresh}`
            }
        };

        const conversacion = await axios.request(options)
            .then(response => {
                console.log(`Obteniendo conversación del ticket: ${ticket_id}`)
                return response.data;
            }).catch(error => {
                console.log(`Error al obtener la conversación del ticket: ${ticket_id}`)
                console.error(error.response.data);
            });

        return conversacion
    }

    async responderConversacion(ticketId, body) {
        const options = {
            method: 'POST',
            url: `https://snoopcx.freshdesk.com/api/v2/tickets/${ticketId}/reply`,
            headers: {
                cookie: '_x_w=41; _x_m=x_c',
                'Content-Type': 'application/json',
                Authorization: `Basic ${this.authFresh}`
            },
            data: {
                body: body
            }
        };

        const respuesta = await axios.request(options)
            .then(response => {
                console.log(`Respondiendo en el ticket: ${ticketId}`)
                console.log(`Se agrego respuesta en el ticket ${ticketId} correctamente`)
                return response.data;
            }).catch(error => {
                console.log(`Error al responder el ticket ${ticketId}`)
                console.error(error.response.data);
            });

        return respuesta
    }

    async updateTicket(ticketId, data) {
        const options = {
            method: 'PUT',
            url: `https://snoopcx.freshdesk.com/api/v2/tickets/${ticketId}`,
            headers: {
                cookie: '_x_w=41; _x_m=x_c',
                'Content-Type': 'application/json',
                Authorization: `Basic ${this.authFresh}`
            },
            data: data
        };

        const update = await axios.request(options)
            .then(response => {
                console.log(`Actualizando ticket: ${ticketId}`)
                console.log(`Se actualizó el ticket ${ticketId} correctamente`)
                return response.data;
            }).catch(error => {
                console.log(`Error al actualizar el ticket ${ticketId}`)
                console.error(error.response.data);
            });
        
        return update
    }
}

exports = FreshdeskClient