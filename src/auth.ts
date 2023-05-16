import { appConfig, overrideConfig } from "./config"
import { getLoginQRToken, loginByOncePassword } from "./request"

var qrcode = require('qrcode-terminal');
var ws = require('ws');

export async function login(force: boolean): Promise<boolean> {
  if (!appConfig.wisdomtreeJtCas || force) {
    console.log("请用知到 App 扫下方二维码登录")

    const loginQRToken = await getLoginQRToken();
    qrcode.generate("https://t.g2s.cn/l8O5?token=" + loginQRToken, { small: true });
    try {
      await new Promise((resolve, reject) => {
        var sock = new ws("wss://appcomm-user.zhihuishu.com/app-commserv-user/websocket?qrToken=" + loginQRToken)

        sock.on("open", function () {
          sock.send(loginQRToken);
        });

        sock.on("error", function (error: any) {
          console.error(error)
          reject(error);
        });

        sock.on("close", function () {
          reject("上方二维码已过期")
        });

        sock.on("message", async function (event: any) {
          try {
            var msg = Buffer.from(event, 'binary').toString('utf-8')
            var info = JSON.parse(msg);

            if (info.code == 0) {
              console.log("扫描成功，请在手机上确认登录。")
            } else if (info.code == 1) {
              const wisdomtreeJtCas = await loginByOncePassword(info.oncePassword)
              appConfig.wisdomtreeJtCas = wisdomtreeJtCas
              // overrideConfig()
              console.log("登录成功，你的智慧树 jt-cas 为：" + wisdomtreeJtCas)
              resolve(true)
              sock.close();
            } else if (info.code == 3) {
              sock.close();
              reject("你已取消登录");
            } else if ("二维码已失效" === info.msg) {
              sock.close();
              reject("二维码已失效");
            }
          } catch (e) {
            reject("登录失败\ne:\t" + e + "\ndata:\t" + event.data);
          }
        });
      })
    } catch (e) {
      console.error(e)
      return false
    }
    return true
  }
  return true
}

export { appConfig }