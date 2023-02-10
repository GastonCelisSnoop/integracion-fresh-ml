const axios = require('axios');
const { addSeconds } = require('date-fns')

class MercadolibreClient {
    constructor() {
        this.tokenML = undefined
    }

    async validarToken() {
        console.log("Validando token");

        if (this.tokenML !== undefined) {
            const agregarHoras = addSeconds(this.tokenML.date, 20000)
            if (agregarHoras === new Date()) {
                return false
            }
        }

        if (this.tokenML === undefined) {
            return false
        }

        return true
    }

    async refrescarToken() {
        console.log("Refrescando token");

        const options = {
            method: 'POST',
            url: 'https://api.mercadolibre.com/oauth/token',
            headers: {
                accept: 'application/json',
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                grant_type: 'refresh_token',
                client_id: '4902771371848937',
                client_secret: 'DlJL6Qd7g7X9NXE6U2YYIViuLMzpOZcj',
                refresh_token: 'TG-6398a8c5c8b2480001fab9dc-1168105783'
            }
        };


        const token = await axios.request(options)
            .then(response => {
                return { ...response.data, date: new Date() }
            })
            .catch(error => {
                console.error(error.response.data);
            });

        this.tokenML = token
    }

    async getPregunta(id) {
        if (!await this.validarToken()) {
            await this.refrescarToken();
        }

        const options = {
            method: 'GET',
            url: `https://api.mercadolibre.com/questions/${id}`,
            headers: {
                Authorization: `Bearer ${this.tokenML.access_token}`
            }
        };

        const pregunta = await axios.request(options)
            .then(response => {
                console.log('Mensaje de PREVENTA recibido correctamente');
                return response.data;
            })
            .catch(error => {
                console.log('Error al recibir el mensaje de PREVENTA');
                console.error(error.response.data);
            });

        return pregunta
    }

    async responderPregunta(question_id, body) {
        if (!await this.validarToken()) {
            await this.refrescarToken();
        }

        const options = {
            method: 'POST',
            url: 'https://api.mercadolibre.com/answers',
            headers: {
                Authorization: `Bearer ${this.tokenML.access_token}`,
                'Content-Type': 'application/json'
            },
            data: { question_id: question_id, text: body }
        };

        const respuesta = await axios.request(options)
            .then(response => {
                console.log('Respondiendo pregunta de Mercado Libre')
                console.log('Se respondió correctamente en Mercado Libre')
                return response.data;
            }).catch(error => {
                if (error.response.data.error === 'not_unanswered_question') {
                    console.log('Ya se respondió a esta pregunta')
                } else {
                    console.log('Error al responder en Mercado Libre')
                    console.error(error.response.data);
                }
            });

        return respuesta
    }

    async getItem(id) {
        if (!await this.validarToken()) {
            await this.refrescarToken();
        }

        const pregunta = await this.getPregunta(id)

        const options = {
            method: 'GET',
            url: 'https://api.mercadolibre.com/items',
            params: { ids: `${pregunta.item_id}` },
            headers: {
                Authorization: `Bearer ${this.tokenML.access_token}`
            }
        };

        const item = await axios.request(options)
            .then(response => {
                return response.data[0].body
            }).catch(error => {
                console.error(error.response.data)
            });

        return item
    }

    async getUsuario(usuarioId) {
        if (!await this.validarToken()) {
            await this.refrescarToken();
        }

        const options = {
            method: 'GET',
            url: `https://api.mercadolibre.com/users/${usuarioId}`,
            headers: {
                Authorization: `Bearer ${this.tokenML.access_token}`
            }
        };

        const usuario = await axios.request(options)
            .then(response => {
                console.log("Usuario obtenido correctamente");
                return response.data
            }).catch(error => {
                console.log("Error al obtener el usuario");
                console.error(error.response.data);
            });

        return usuario
    }

    async getMensajePostVenta(mensajeID) {
        if (!await this.validarToken()) {
            await this.refrescarToken();
        }

        const options = {
            method: 'GET',
            url: `https://api.mercadolibre.com/messages/${mensajeID}`,
            params: { tag: 'post_sale' },
            headers: {
                Authorization: `Bearer ${this.tokenML.access_token}`
            }
        };

        const mensaje = await axios.request(options)
            .then(response => {
                console.log('Mensaje de POSTVENTA recibido correctamente');
                return response.data
            }).catch(error => {
                console.log('Error al recibir el mensaje de POSTVENTA');
                console.error(error.response.data);
            });

        return mensaje
    }

    async responerMensajePostVenta(idOrden, idVendedor, idComprador, mensaje) {
        if (!await this.validarToken()) {
            await this.refrescarToken();
        }

        const options = {
            method: 'POST',
            url: `https://api.mercadolibre.com/messages/packs/${idOrden}/sellers/${idVendedor}`,
            params: { tag: 'post_sale' },
            headers: {
                Authorization: `Bearer ${this.tokenML.access_token}`,
                'Content-Type': 'application/json'
            },
            data: {
                from: { user_id: idVendedor },
                to: { user_id: idComprador },
                text: mensaje
            }
        };

        const respuesta = await axios.request(options)
            .then(response => {
                console.log('Respondiendo mensaje postventa Mercado Libre')
                console.log('Se respondió correctamente en Mercado Libre')
                return response.data;
            }).catch(error => {
                console.log('Error al responder mensaje postventa Mercado Libre')
                console.error(error.response.data);
            });

        return respuesta
    }

    async getMensajeReclamo(reclamoId) {
        if (!await this.validarToken()) {
            await this.refrescarToken();
        }

        const options = {
            method: 'GET',
            url: `https://api.mercadolibre.com/v1/claims/${reclamoId}/messages`,
            headers: {
                Authorization: `Bearer ${this.tokenML.access_token}`
            }
        };

        const mensaje = await axios.request(options)
            .then(response => {
                console.log('Mensaje de RECLAMO recibido correctamente')
                return response.data
            }).catch(error => {
                console.log('Error al recibir el mensaje de RECLAMO');
                console.error(error.response.data);
            });

        return mensaje
    }

    async getDetalleReclamo(reclamoId) {
        if (!await this.validarToken()) {
            await this.refrescarToken();
        }

        const options = {
            method: 'GET',
            url: `https://api.mercadolibre.com/v1/claims/${reclamoId}`,
            headers: {
                Authorization: `Bearer ${this.tokenML.access_token}`
            }
        };

        const mensaje = await axios.request(options)
            .then(response => {
                console.log('Obteniendo detalle del RECLAMO')
                console.log('Detalle del RECLAMO recibido correctamente')
                return response.data
            }).catch(error => {
                console.log('Error al recibir el detalle del RECLAMO');
                console.error(error.response.data);
            });

        return mensaje
    }

    async responderMensajeReclamo(reclamoId, texto) {
        if (!await this.validarToken()) {
            await this.refrescarToken();
        }

        const options = {
            method: 'POST',
            url: `https://api.mercadolibre.com/v1/claims/${reclamoId}/messages`,
            headers: {
                Authorization: `Bearer ${this.tokenML.access_token}`,
                'Content-Type': 'application/json'
            },
            data: {
                receiver_role: 'complainant',
                message: texto
            }
        };

        const respuesta = await axios.request(options)
            .then(response => {
                console.log('Respondiendo el reclamo en Mercado Libre')
                console.log('Se respondió correctamente el reclamo en Mercado Libre')
                return response.data;
            }).catch(error => {
                console.log('Error al responder el reclamo en Mercado Libre')
                console.error(error.response.data);
            });

        return respuesta
    }

    async getOrdenCompra(idCompra) {
        if (!await this.validarToken()) {
            await this.refrescarToken();
        }

        const options = {
            method: 'GET',
            url: `https://api.mercadolibre.com/orders/${idCompra}`,
            headers: {
                Authorization: `Bearer ${this.tokenML.access_token}`
            }
        };

        const orden = axios.request(options)
            .then(response => {
                console.log('Obteniendo orden de compra')
                console.log('Orden de compra obtenida correctamente')
                return response.data
            }).catch(error => {
                console.log('Error al obtener la orden de compra');
                console.error(error.response.data);
            });

        return orden
    }
}

exports = MercadolibreClient;