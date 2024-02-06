import { TWithId } from '../models/common.model.js';
import { getDbClient } from '../dal/mongo/core.access.js';
import { CompanyManager } from '../dal/mongo/company.access.js';
import { UserManager } from '../dal/mongo/user.access.js';
import { RespondentManager } from '../dal/mongo/respondent.access.js';
import { DepartmentManager } from '../dal/mongo/department.access.js';
import { IUser, Scopes } from '../models/user.model.js';
import { ICompany } from '../models/company.model.js';
import { IDepartment } from '../models/department.model.js';
import { IRespondent, SignUpStatus } from '../models/respondent.model.js';
import { SurveyManager } from '../dal/mongo/survey.access.js';
import { QuestionManager } from '../dal/mongo/question.access.js';
import { SurveyProgressManager } from '../dal/mongo/survey-progress.access.js';

const { dbClient } = getDbClient()

const companyManager = new CompanyManager(dbClient);
const userManager = new UserManager(dbClient);
const respondentManager = new RespondentManager(dbClient, userManager);
const departmentManager = new DepartmentManager(dbClient);
const questionManager = new QuestionManager(dbClient);
const surveyProgressManager = new SurveyProgressManager(dbClient);
const surveyManager = new SurveyManager(dbClient, questionManager, surveyProgressManager, respondentManager);


const createAdmin = async () => {
    const userAdmin = await userManager.createUser({
        email: 'asv@alexrovich.ru',
        password: 'asdfasdf',
        scope: Scopes.Admin,
        companyId: undefined
    })
    console.log(`\ncreateAdmin:`);
    console.log(userAdmin);
    return userAdmin
}

const createCompanies = async () => {
    const companyAlx = await companyManager.create({
        name: 'ALEXROVICH'
    });
    /* const companyRevator = await companyManager.create({
        name: 'REVATOR'
    }); */

    console.log(`\ncreateCompanies:`);
    console.log(companyAlx);
    /* console.log(companyRevator);
 */
    return { companyAlx, /* companyRevator */ }
}

const createDepartmentsAlx = async (companyAlx: TWithId<ICompany>) => {
    const depAlxAdm = await departmentManager.create({
        title: 'Администрация',
        companyId: companyAlx._id
    });


    const depAlxSales = await departmentManager.create({
        title: 'Отдел продаж',
        companyId: companyAlx._id,
        //parentDepartmentId: depAlxAdm._id
    });


    const depAlxTO = await departmentManager.create({
        title: 'Технический отдел',
        companyId: companyAlx._id,
        //parentDepartmentId: depAlxAdm._id
    });

    const depAlxHR = await departmentManager.create({
        title: 'Отдел кадров',
        companyId: companyAlx._id,
        //parentDepartmentId: depAlxAdm._id
    })

    console.log(`\ncreateDepartmentsAlx:`);
    console.log(depAlxAdm);
    console.log(depAlxSales);
    console.log(depAlxTO);
    console.log(depAlxHR);

    return { depAlxAdm, depAlxSales, depAlxTO, depAlxHR }
}

const createRespondentsAlx = async (companyAlx: TWithId<ICompany>,
    depAlxSales: TWithId<IDepartment>,
    depAlxTO: TWithId<IDepartment>,
    depAlxHR: TWithId<IDepartment>) => {

    const respAlxHR = await respondentManager.create({
        firstName: 'Диана',
        lastName: 'Михальчук',
        email: 'hr@alexrovich.ru',
        departmentId: depAlxHR._id,
        scope: Scopes.HR,
        companyId: companyAlx._id
    })

    const respAlxUser1 = await respondentManager.create({
        firstName: 'Егор',
        lastName: 'Долгих',
        email: 'ooo@alexrovich.ru',
        departmentId: depAlxTO._id,
        scope: Scopes.User,
        companyId: companyAlx._id
    })

    const respAlxUser2 = await respondentManager.create({
        firstName: 'Артем',
        lastName: 'Ковтунов',
        email: 'kkk@alexrovich.ru',
        departmentId: depAlxTO._id,
        scope: Scopes.User,
        companyId: companyAlx._id
    })

    const respAlxUser3 = await respondentManager.create({
        firstName: 'Алексей',
        lastName: 'Щербаков',
        email: 'mmm@alexrovich.ru',
        departmentId: depAlxSales._id,
        scope: Scopes.User,
        companyId: companyAlx._id
    })

    console.log(`\ncreateRespondentsAlx:`);
    console.log(respAlxHR);
    console.log(respAlxUser1);
    console.log(respAlxUser2);
    console.log(respAlxUser3);

    return { respAlxHR, respAlxUser1, respAlxUser2, respAlxUser3 }
}

const createUsersAlx = async (companyAlx: TWithId<ICompany>,
    respAlxHR: TWithId<IRespondent>,
    respAlxUser1: TWithId<IRespondent>,
    respAlxUser2: TWithId<IRespondent>,
    respAlxUser3: TWithId<IRespondent>) => {

    const alxUserHR = await userManager.createUser({
        email: respAlxHR.email,
        password: 'asdfasdf',
        scope: respAlxHR.scope,
        companyId: companyAlx._id,
        respondentId: respAlxHR._id
    })
    respondentManager.update(respAlxHR._id, { signUpStatus: SignUpStatus.SingedUp });

    const alxUser1 = await userManager.createUser({
        email: respAlxUser1.email,
        password: 'asdfasdf',
        scope: respAlxUser1.scope,
        companyId: companyAlx._id,
        respondentId: respAlxUser1._id
    })
    respondentManager.update(respAlxUser1._id, { signUpStatus: SignUpStatus.SingedUp });

    const alxUser2 = await userManager.createUser({
        email: respAlxUser2.email,
        password: 'asdfasdf',
        scope: respAlxUser2.scope,
        companyId: companyAlx._id,
        respondentId: respAlxUser2._id
    })
    respondentManager.update(respAlxUser2._id, { signUpStatus: SignUpStatus.SingedUp });

    const alxUser3 = await userManager.createUser({
        email: respAlxUser3.email,
        password: 'asdfasdf',
        scope: respAlxUser3.scope,
        companyId: companyAlx._id,
        respondentId: respAlxUser3._id
    })
    respondentManager.update(respAlxUser3._id, { signUpStatus: SignUpStatus.SingedUp });

    console.log(`\ncreateUsersAlx:`);
    console.log(alxUserHR);
    console.log(alxUser1);
    console.log(alxUser2);
    console.log(alxUser3);

    return { alxUserHR, alxUser1, alxUser2, alxUser3 }
}

const generateSurvey = async (company: TWithId<ICompany>, respondent: TWithId<IRespondent>) => {
    const survey = await surveyManager.generateSurvey(respondent._id, company._id);
    console.log(`\ngenerateSurvey:`);
    console.log(survey);
}

const dropCollections = async (collectionNames: Array<string>) => {
    for await (let collection of collectionNames) {
        dbClient.db('burnout').collection(collection).drop();
    }
}


(async () => {

    await dropCollections(['Companies', 'Users', 'Respondents', 'Departments', 'Companies', 'Surveys', 'SurveyResults', 'IssuedSignupTokens', 'SurveyProgress', 'sessions']);


    let userAdmin = await dbClient.db('burnout').collection('Users').findOne({ scope: Scopes.Admin }) as any as TWithId<IUser>;
    if (!userAdmin) {
        userAdmin = await createAdmin();
    }

    const { companyAlx, /* companyRevator */ } = await createCompanies();

    const { depAlxAdm, depAlxSales, depAlxTO, depAlxHR } = await createDepartmentsAlx(companyAlx);
    const { respAlxHR, respAlxUser1, respAlxUser2, respAlxUser3 } = await createRespondentsAlx(companyAlx, depAlxSales, depAlxTO, depAlxHR);
    const { alxUserHR, alxUser1, alxUser2, alxUser3 } = await createUsersAlx(companyAlx, respAlxHR, respAlxUser1, respAlxUser2, respAlxUser3);

    await generateSurvey(companyAlx, respAlxUser1);
    dbClient.close();

})();