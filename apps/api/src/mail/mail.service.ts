import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendFeedbackEmail(feedback: any, user: any) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL não está configurado. E-mail de feedback não enviado.');
      return;
    }
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      this.logger.warn('Credenciais SMTP não configuradas. E-mail de feedback não enviado.');
      return;
    }

    const mailOptions = {
      from: `"AVANTE App" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `[AVANTE] Novo Feedback: ${feedback.type.toUpperCase()}`,
      html: `
        <h2>Novo Feedback Recebido</h2>
        <p><strong>Tipo:</strong> ${feedback.type}</p>
        <p><strong>Usuário:</strong> ${user?.name || 'Desconhecido'} (${user?.email || 'Sem e-mail'})</p>
        <p><strong>Página de Origem:</strong> ${feedback.page || 'Não informada'}</p>
        <p><strong>Status:</strong> ${feedback.status}</p>
        <hr />
        <p><strong>Mensagem:</strong></p>
        <p><em>${feedback.message}</em></p>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`E-mail de feedback enviado: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Erro ao enviar e-mail de feedback', error);
    }
  }
}
