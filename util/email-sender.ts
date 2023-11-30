import * as nodemailer from 'nodemailer';
import emailSenderConfig from './email.config.json' assert { type: "json"};
import * as fs from 'fs/promises';
import * as path from 'path';

interface ISendOptions {
    from: string, // from email
    to: string, // to email
    subject: string, //subject line
    text: string, //plain text body
    html: string, //html body
}

interface IInviteParams {
    userName: string,
    inviterName: string,
    signUpLink: string,
}

interface ISurveyParams {
    respondentName: string,
    surveyUrl: string
}

const getInviteSubject = () => {
    return 'Регистрация в сервисе "Антивыгорание" от ALEXROVICH.RU';
}

const getInviteTextBody = (params: IInviteParams) => {
    return `Здравствуйте, ${params.userName}!\n\n` +
        `${params.inviterName} зарегистрировал(-а) Вас в сервисе "Антивыгорание" от ALEXROVICH.RU.\n` +
        `Для активации Вашей учетной записи перейдите по ссылке: ${params.signUpLink} \n\n` +
        'Если Вы получили это письмо по ошибке, просто проигнорируйте его.\n' +
        '-----\n' +
        'С уважением,\n' +
        'Робот ALEXROVICH.RU'
}

const getInviteHTMLBody = async (params: IInviteParams) => {

    try {
        const filePath = path.resolve('./util/invite-email.template.html');
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

const getSurveySubject = () => {
    return 'Пройдите опрос';
}

const getSurveyTextBody = (params: ISurveyParams) => {
    return `Здравствуйте, ${params.respondentName}!\n\n` +
        `Пришло время для нового опроса в сервисе "Антивыгорание" от ALEXROVICH.RU.\n` +
        `Для прохождения опроса перейдите по ссылке: ${params.surveyUrl} \n\n` +
        'Если Вы получили это письмо по ошибке, просто проигнорируйте его.\n' +
        '-----\n' +
        'С уважением,\n' +
        'Робот ALEXROVICH.RU'
}

const getSurveyHTMLBody = async (params: ISurveyParams) => {

    try {
        const filePath = path.resolve('./util/survey-email.template.html');
        let html = (await fs.readFile(filePath)).toString();
        html = setParameter(html, 'respondentName', params.respondentName);
        html = setParameter(html, 'surveyUrl', params.surveyUrl);
        return html;
    } catch (err) {
        console.log(err)
        return getSurveyTextBody(params);
    }

}


const setParameter = (text: string, paramName: string, paramValue: string) => {
    return text.replaceAll(`{{${paramName}}}`, paramValue);
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



export const sendInviteEmail = async (email: string, params: IInviteParams) => {

    const options: ISendOptions = {
        from: getSenderName(),
        to: email,
        subject: getInviteSubject(),
        text: getInviteTextBody(params),
        html: await getInviteHTMLBody(params)
    }

    const info = await sendEmail(options);
    console.log('email sent: ', info);

}

export const sendSurveyEmail = async(email: string, params: ISurveyParams) => {
    const options: ISendOptions = {
        from: getSenderName(),
        to: email,
        subject: getSurveySubject(),
        text: getSurveyTextBody(params),
        html: await getSurveyHTMLBody(params)
    }

    const info = await sendEmail(options);
    console.log('email sent: ', info);
}

function getSenderName() {
    return 'ALEXROVICH.RU Сервис "Антивыгорание" <report@alexrovich.ru>'
}

/* (async () => {

    const inviteParams = {
        userName: 'Антон',
        inviterName: 'Михайлова Диана',
        signUpLink: 'http://localhost:4200',
    }

    const surveyParams = {
        respondentName: 'Антон',
        surveyUrl: 'http://localhost:4200',
    }

    //sendInviteEmail('job-av@yandex.ru', inviteParams);
    sendSurveyEmail('job-av@yandex.ru', surveyParams);
})() */