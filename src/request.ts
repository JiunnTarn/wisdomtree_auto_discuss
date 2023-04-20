import axios, { AxiosError } from 'axios'
import { appConfig } from "./config"
import { QuestionInfo } from "./types"
import axiosRetry from "axios-retry"
import { encrypt, rsaEncrypt } from "./enc"

function getSender(authorization?: string) {
    const sender = axios.create({
        headers: {
            'Content-Type': authorization == 'Bearer' ? 'application/json' : 'application/x-www-form-urlencoded; charset=UTF-8',
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
        maxRedirects: 0
    })
    sender.interceptors.response.use(function (response) {
        return response;
    }, function (error) {
        // 登录的 cookie 是在一个状态码为 302 的响应中获取的
        // 但是 axios 似乎无法手动处理 302 响应
        // 因此设置了 maxRedirects=0
        // 这样导致这个重定向响应会进入 error 处理流程
        // 所以在这里对 302 响应进行特殊处理
        if ((error as AxiosError).response?.status == 302) {
            return /jt-cas=(.*?); Domain=.zhihuishu.com;/.exec(error.response.headers['set-cookie'])?.[1]
        }
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

export async function getLoginQRToken(): Promise<string> {
    let resp = await getSender().get('https://passport.zhihuishu.com/qrCodeLogin/getLoginQrImg')
    return resp.data.qrToken
}

export async function loginByOncePassword(oncePassword: string): Promise<string> {
    let url = 'https://passport.zhihuishu.com/login?pwd=' + oncePassword + '&service=https://onlineservice-api.zhihuishu.com/login/gologin'
    let resp = await getSender().get(url)
    return resp.toString()
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
    const url = 'https://api-chat-2.zecoba.cn/v1/chat/completions'
    const body = '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"' + prompt + '？请简短回答，控制在5-15个字（不计标点）。谢谢！"}]}';
    let resp = await getSender("Bearer").post(url, body)
    if (resp.status == 200) {
        return resp.data.choices[0].message.content.replace(/\n/g, "")
    } else {
        console.error(resp)
        throw "获取回答失败"
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