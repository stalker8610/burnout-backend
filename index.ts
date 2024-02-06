import { startWebServer } from './router.js';
import { getDbClient, closeDbClient } from './dal/mongo/core.access.js';
import { gracefulWebServerShutdown } from './router.js';

import { UserManager } from './dal/mongo/user.access.js';
import { CompanyManager } from './dal/mongo/company.access.js';
import { RespondentManager } from './dal/mongo/respondent.access.js';
import { DepartmentManager } from './dal/mongo/department.access.js';
import { SingupTokenManager } from './dal/mongo/signup-token.access.js';
import { SurveyManager } from './dal/mongo/survey.access.js';
import { SurveyResultManager } from './dal/mongo/survey-result.access.js';
import { SignUpStatus } from './models/respondent.model.js';
import { ReportWallManager } from './dal/mongo/reports/report-wall.access.js';
import { ReportPassStatisticManager } from './dal/mongo/reports/report-pass-statistic.access.js';
import { ReportCompanyScoresManager } from './dal/mongo/reports/report-company-scores.access.js';
import { ReportPersonalEfficiencyManager } from './dal/mongo/reports/report-personal-efficiency.access.js';
import { ReportPersonalSkillsManager } from './dal/mongo/reports/report-personal-skills.access.js';
import { SurveyProgressManager } from './dal/mongo/survey-progress.access.js';
import { QuestionManager } from './dal/mongo/question.access.js';

const { dbClient, dbClientPromise } = getDbClient();

const userManager = new UserManager(dbClient);
const respondentManager = new RespondentManager(dbClient, userManager);
const questionManager = new QuestionManager(dbClient);

const surveyProgressManager = new SurveyProgressManager(dbClient);
const surveyManager = new SurveyManager(dbClient, questionManager, surveyProgressManager, respondentManager);

const surveyResultManager = new SurveyResultManager(dbClient, respondentManager, surveyManager, surveyProgressManager);

const tokenManager = new SingupTokenManager(dbClient, respondentManager);
const departmentManager = new DepartmentManager(dbClient);
const companyManager = new CompanyManager(dbClient);

const reportWallManager = new ReportWallManager(dbClient);
const reportPassStatisticManager = new ReportPassStatisticManager(dbClient);
const reportCompanyScoresManager = new ReportCompanyScoresManager(dbClient);
const reportPersonalEfficiencyManager = new ReportPersonalEfficiencyManager(dbClient);
const reportPersonalSkillsManager = new ReportPersonalSkillsManager(dbClient);

const webServer = startWebServer(dbClientPromise, {
    respondentManager,
    surveyManager,
    surveyResultManager,
    userManager,
    tokenManager,
    departmentManager,
    companyManager,
    reportWallManager,
    reportPassStatisticManager,
    reportCompanyScoresManager,
    reportPersonalEfficiencyManager,
    reportPersonalSkillsManager
});


process.on('SIGTERM', () => {
    closeDbClient(dbClient);
    gracefulWebServerShutdown(webServer);
})


/* setInterval(async () => {

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (now.getDay() === 3) {
        //wednesday - let's generate surveys
        const respondents = await respondentManager.getAll();
        for (let respondent of respondents) {
            if (respondent.signUpStatus === SignUpStatus.SingedUp && respondent.doSendSurveys) {
                const currentSurvey = await surveyManager.getLastForRespondent(respondent._id);
                if (!currentSurvey || currentSurvey.createdAt.getTime() < now.getTime()) {
                    await surveyManager.generateSurvey(respondent._id, respondent.companyId)
                }
            }
        }
    }

}, 24 * 60 * 60 * 1000) */
