import * as sgMail from '@sendgrid/mail'
import { MailDataRequired } from '@sendgrid/helpers/classes/mail'
import config from '../config'
import { TransactionData } from '../interfaces/transactionData'
import { ContactForm } from '../interfaces/contactForm'

export async function sendActivationUrl(email: string, token: string) {
  sgMail.setApiKey(config.sendGridApiKey)
  const mailData: MailDataRequired = {
    to: email,
    from: 'no-reply@bloom.com',
    subject: 'Activa tu cuenta de Bloom',
    html: `
      <div>
        Ve al siguiente enlace para activar tu cuenta:
        <br/>
        <a href='${config.backendUrl}/auth/activate/${token}'>Activar mi cuenta!</a>
      </div>
    `,
  }
  return await sgMail.send(mailData)
}

export async function sendPurchaseConfirmation(email: string, transactionData: TransactionData) {
  console.log('transactionData', transactionData)

  sgMail.setApiKey(config.sendGridApiKey)
  let subtotal = 0
  let charges = 0
  let withCharges = 0
  transactionData.tickets.forEach((ticket) => {
    subtotal += ticket.total
    charges += ticket.total * parseFloat(ticket.commision)
    withCharges += ticket.total + ticket.total * parseFloat(ticket.commision)
  })

  let tax = transactionData.invoice ? withCharges * 0.16 : 0
  let total = withCharges + tax

  let rows = ''
  transactionData.tickets.forEach((ticket) => {
    rows += `<div>--${ticket.quantity}x ${ticket.type} : $${parseFloat(ticket.individualCost).toFixed(2)}</div>`
  })

  rows += `<div>Subtotal: $${subtotal.toFixed(2)}</div>`
  rows += `<div>Cargos por servicio: $${charges.toFixed(2)}</div>`
  if (transactionData.invoice) rows += `<div> IVA: $${tax.toFixed(2)}</div>`
  rows += `<div>Total: $${total.toFixed(2)}</div>`

  const mailData: MailDataRequired = {
    to: email,
    from: 'no-reply@vtickets.com',
    subject: 'Tu compra de Virtual Tickets',
    html: `
      <div>
        Tu compra se ha hecho satisfactoriamente.
        Puedes consultar los datos de tu transacción en el panel "Mis Compras" dentro de nuestro sitio web
      </div>
      <div>
        Resumen de compra:
      </div>
      <div>
        ${rows}
      </div>
    `,
  }
  return await sgMail.send(mailData)
}

export async function sendContactMail(data: ContactForm) {
  sgMail.setApiKey(config.sendGridApiKey)
  const mailData: MailDataRequired = {
    to: 'vtickets@digitalignition.com.mx',
    from: data.email,
    subject: data.motive,
    html: `
      <div><span>Nombre: </span> ${data.name} ${data.lastname}</div>
      <div><span>Mensaje: </span> ${data.message}</div>
    `,
  }
  return await sgMail.send(mailData)
}

export async function sendClientAutomatedResponse(name: string, email: string) {
  sgMail.setApiKey(config.sendGridApiKey)
  const mailData: MailDataRequired = {
    to: email,
    from: 'vtickets@digitalignition.com.mx',
    subject: 'Contacto Virtual Tickets',
    html: `
    <html xmlns="https://www.w3.org/1999/xhtml">
    <head>
      <title>Contacto Virtual Tickets</title>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0 " />
      <style>
        @font-face {
          src: url("https://vtickets.com.mx/fonts/Stark.otf");
          font-family: "Stark";
        }
      </style>
    </head>
    <body style="background-color: #12161f; padding: 15px;">
      <div
        class="container"
        style="
          background-color: #292f3a;
          max-width: 700px;
          margin: auto;
          color: #56d6c5;
        "
      >
        <div class="image-container" style="text-align: center;">
          <img
            src="https://vtickets.com.mx/logo512.png"
            alt="Virtual Tickets"
            style="width: 128px; margin: 50px 0;"
          />
        </div>
        <div
          class="text"
          style="
            text-align: center;
            font-size: 1.5rem;
            padding: 30px;
            padding-bottom: 100px;
            line-height: 2.5rem;
            font-family: Stark, sans-serif;
          "
        >
          Hola ${name}, gracias por ponerte en contacto con nosotros, en
          breve te enviaremos más información.
        </div>
      </div>
    </body>
  </html>
    `,
  }
  return await sgMail.send(mailData)
}
