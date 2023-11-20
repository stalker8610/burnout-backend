import * as nodemailer from 'nodemailer';
import emailSenderConfig from './email.config.json' assert { type: "json"};
import * as fs from 'fs/promises';
import * as path from 'path';

const getInviteSubject = () => {
    return 'Регистрация в сервисе "Антивыгорание" от ALEXROVICH.RU';
}

interface IInviteBodyParams {
    userName: string,
    inviterName: string,
    signUpLink: string
}

const getInviteTextBody = (params: IInviteBodyParams) => {
    return `Здравствуйте, ${params.userName}!\n\n` +
        `${params.inviterName} зарегистрировал(-а) Вас в сервисе "Антивыгорание" от ALEXROVICH.RU.\n` +
        `Для активации Вашей учетной записи перейдите по ссылке: ${params.signUpLink} \n` +
        '\nЕсли Вы получили это письмо по ошибке, просто проигнорируйте его.\n' +
        '-----\n' +
        'С уважением,\n' +
        'Робот ALEXROVICH.RU'
}

const getInviteHTMLBody = async (params: IInviteBodyParams) => {

    try {
        const filePath = path.resolve('./email.template.html');
        let html = (await fs.readFile(filePath)).toString();
        html = setParameter(html, 'userName', params.userName);
        html = setParameter(html, 'inviterName', params.inviterName);
        html = setParameter(html, 'signUpLink', params.signUpLink);
        return html;
    } catch (err) {
        console.log(err)
        return getInviteTextBody(params);
    }

}

const setParameter = (text: string, paramName: string, paramValue: string) => {
    return text.replaceAll(`{{${paramName}}}`, paramValue);
}

interface ISendOptions {
    from: string, // from email
    to: string, // to email
    subject: string, //subject line
    text: string, //plain text body
    html: string, //html body
}

export const sendEmail = async (options: ISendOptions) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.yandex.ru",
        port: 465,
        secure: true,
        auth: {
            user: emailSenderConfig.user,
            pass: emailSenderConfig.password,
        },
    });

    const info = await transporter.sendMail({
        from: options.from, // sender address
        to: options.to,
        subject: options.subject, // Subject line
        text: options.text, // plain text body
        html: options.html, // html body
    });

    return info;

}

interface IInviteParams {
    userName: string,
    inviterName: string,
    signUpLink: string,
    toEmail: string
}

export const sendInviteEmail = async (params: IInviteParams) => {

    const options: ISendOptions = {
        from: getSenderName(),
        to: params.toEmail,
        subject: getInviteSubject(),
        text: getInviteTextBody(params),
        html: await getInviteHTMLBody(params)
    }

    const info = await sendEmail(options);
    console.log('email sent: ', info);

}

function getSenderName() {
    return 'ALEXROVICH.RU Сервис "Антивыгорание" <report@alexrovich.ru>'
}

/* (async () => {

    const params = {
        userName: 'Антон',
        inviterName: 'Михайлова Диана',
        signUpLink: 'http://localhost:4200',
        toEmail: 'job-av@yandex.ru'
    }

    sendInviteEmail(params)
})() */