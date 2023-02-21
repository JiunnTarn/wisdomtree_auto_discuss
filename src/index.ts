import { getQuestionList, canAnswered, getAnswer, saveAnswer, likeAnswer, likeAnswerVice } from "./request"
import { appConfig } from "./config"
import { login } from "./auth"

async function start() {
  while(!await login(false)) {}

  for (var i = appConfig.from; i <= appConfig.to; ++i) {
    const questionList = await getQuestionList(i)
    for (let question of questionList) {
      const qid = question.questionId
      const questionContent = question.content
      console.log("============= qid: " + qid + " ==============")
      console.log("问题：\t" + questionContent)
      if (await canAnswered(qid)) {
        const answer = await getAnswer(questionContent)
        const answerId = await saveAnswer(answer, qid)
        console.log("回答：\t" + answer)
        await likeAnswer(answerId)
        if (appConfig.viceWisdomtreeJtCasList != undefined) {
          for (let viceWisdomtreeJtCas of appConfig.viceWisdomtreeJtCasList) {
            await likeAnswerVice(answerId, viceWisdomtreeJtCas)
          }
        }
      } else {
        console.log("你已经回答过这个问题了")
      }
      console.log()
    }
  }
  console.log("完成")
}

start()