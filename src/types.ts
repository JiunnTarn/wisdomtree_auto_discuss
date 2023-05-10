import { AxiosProxyConfig } from 'axios'

export interface AppConfig {
    courseId: number,
    recruitId: number,
    from: number,
    to: number,
    apiKey: string,
    apiHost?: string,
    wisdomtreeJtCas?: string,
    viceWisdomtreeJtCasList?: string[],
    proxy?: AxiosProxyConfig,
    interval?: number
}

export interface QuestionInfo {
    "recruitId": number,
    "courseId": number,
    "courseName": string,
    "questionId": number,
    "hotValue": number,
    "content": string,
    "contentShowStatus": number,
    "answerNum": number,
    "onlookerNum": number,
    "onlookerTime"?: number,
    "time": number,
    "timeStr": string,
    "chapterId"?: number,
    "chapterName"?: string,
    "videoId"?: number,
    "watchNum": number,
    "createTime": number,
    "dataId"?: number,
    "questionUserId": number,
    "isTeacher": number,
    "elite": number,
    "userDto": UserDTO,
    "topping": number,
    "qaAnswerInfoWebDtoList"?: string,
    "annexList"?: string,
    "push": boolean,
    "createUser"?: boolean,
    "answer"?: boolean,
    "onlooker": boolean
}

export interface UserDTO {
    "uuid"?: number,
    "userId"?: number,
    "username": string,
    "schoolId": number,
    "schoolName": string,
    "avatar": string,
    "teacher"?: string
}