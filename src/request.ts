import axios, { AxiosError } from 'axios'
import { appConfig } from "./config"
import { QuestionInfo } from "./types"
import axiosRetry from "axios-retry"
import { encrypt, rsaEncrypt } from "./enc"
import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
    apiKey: appConfig.openAIApiKey,
});
const openai = new OpenAIApi(configuration);

function getSender(authorization?: string) {
    const sender = axios.create({
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0',
            'Authorization': authorization ? authorization : appConfig.wisdomtreeJtCas,
        },
        transformResponse: data => {
            try {
                return JSON.parse(data)
            } catch (_e) {
                return data
            }
        },
    })
    sender.interceptors.response.use(function (response) {
        return response;
    }, function (error) {
        if ((error as AxiosError).response?.status == 401) {
            throw "智慧树 jt-cas 已过期或非法，请检查 config.yaml"
        }
    });
    axiosRetry(sender, {
        retries: 2,
        shouldResetTimeout: true,
        retryCondition: (_error) => true,
    })
    return sender
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function getDynStr(): Promise<string> {
    let data = '{"module":10}'
    let uid = rsaEncrypt(data)
    let resp = await getSender().get('http://appcomm-user.zhihuishu.com/app-commserv-user/c/hasV2?uid=' + uid)
    if (resp.data.status == 200) {
        return resp.data.rt.sl
    } else {
        console.log(resp)
        throw "获取 dynStr 失败"
    }
}

export async function getQuestionList(page: number): Promise<QuestionInfo[]> {
    page = page * 50
    let url = 'http://creditqa-api.zhihuishu.com/creditqa/gateway/t/v1/web/qa/getHotQuestionList'
    let data = '{"courseId":"' + appConfig.courseId + '","pageIndex":' + page + ',"pageSize":50,"recruitId":"' + appConfig.recruitId + '"}'
    let secretStr = encrypt(data, await getDynStr())
    let body = {
        'secretStr': secretStr,
        'dateFormate': new Date().getTime()
    }
    let resp = await getSender().post(url, body)
    if (resp.data.status == "200") {
        return resp.data.rt.questionInfoList
    } else {
        console.error(resp)
        throw "获取热门问题列表失败"
    }
}

export async function canAnswered(questionId: number): Promise<boolean> {
    const url = 'http://creditqa-api.zhihuishu.com/creditqa/gateway/t/v1/web/qa/getQuestionInfo'
    const data = '{"questionId": "' + questionId + '","sourceType": "2"}'
    const secretStr = encrypt(data, await getDynStr())
    const body = {
        'secretStr': secretStr,
        'dateFormate': new Date().getTime()
    }
    let resp = await getSender().post(url, body)
    if (resp.data.status == "200") {
        return !resp.data.rt.isMyQuestion && !resp.data.rt.questionInfo.isAnswer
    } else {
        console.error(resp)
        throw "查看问题回答状态失败"
    }
}

export async function getAnswer(prompt: string): Promise<string> {
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt + "。你的回答的总字数不能少于四个字，但也不能超过15个字。",
        max_tokens: 100,
    });
    let answer = completion.data.choices[0].text
    if (answer != undefined) {
        return answer.replace(/\n/g, "")
    } else {
        console.error(completion)
        throw "获取 OpenAI 回答失败"
    }
}

export async function saveAnswer(answer: string, qid: number): Promise<string> {
    const url = 'http://creditqa-api.zhihuishu.com/creditqa/gateway/t/v1/web/qa/saveAnswer'
    const data = '{"annexs":"[]","qid":"' + qid + '","source":"2","aContent":"' + answer + '","courseId":"' + appConfig.courseId + '","recruitId":"' + appConfig.recruitId + '","saveSource":1}'
    const secretStr = encrypt(data, await getDynStr())
    const body = {
        'secretStr': secretStr,
        'dateFormate': new Date().getTime()
    }
    let resp = await getSender().post(url, body)
    if (resp.data.status == "200") {
        return resp.data.rt.answerId
    } else {
        console.error(resp)
        throw "回答问题失败"
    }
}

export async function likeAnswer(answerId: string): Promise<boolean> {
    const url = 'http://creditqa-api.zhihuishu.com/creditqa/gateway/t/v1/web/qa/updateOperationToLike'
    const data = '{"islike":"0","answerId":"' + answerId + '"}'
    const secretStr = encrypt(data, await getDynStr())
    const body = {
        'secretStr': secretStr,
        'dateFormate': new Date().getTime()
    }
    let resp = await getSender().post(url, body)
    if (resp.data.status == "200") {
        return true
    } else {
        console.error(resp)
        throw "点赞失败"
    }
}

export async function likeAnswerVice(answerId: string, authorization: string): Promise<boolean> {
    const url = 'http://creditqa-api.zhihuishu.com/creditqa/gateway/t/v1/web/qa/updateOperationToLike'
    const data = '{"islike":"0","answerId":"' + answerId + '"}'
    const secretStr = encrypt(data, await getDynStr())
    const body = {
        'secretStr': secretStr,
        'dateFormate': new Date().getTime()
    }
    let resp = await getSender(authorization).post(url, body)
    if (resp.data.status == "200") {
        return true
    } else {
        console.error(resp)
        throw "其他账号点赞失败"
    }
}