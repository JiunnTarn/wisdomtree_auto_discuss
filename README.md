# 智慧树知到自动讨论
还在为形式主义小水课互动分不高而头疼？**为什么我苦苦回答了 139 个问题，收获了 280 个点赞，居然还只有 8 分？？？？？**

![image-20221228153507081.png](https://bj.bcebos.com/baidu-rmb-video-cover-1/6a27c6a65caa86f3d0ebb4318ac469d8.png)

不要怕，让这个脚本拯救你！让人工智能成为刺破形式主义的利剑！

它能自动回答热门问题列表中的问题（回答来自 OpenAI 开发的语言模型），并自动点赞，还可以帮你的好友给你点赞😋



## 食用教程

### 前期准备

1. 你需要准备一个 OpenAI 账号，注册方法自行研究，注册好以后在 [Account API Keys - OpenAI API](https://beta.openai.com/account/api-keys) 申请一个 `API Key` 。

   请注意每次回答都是要钱的，不过好在 OpenAI 给了你 $18 的免费额度，你可以在 [Account - OpenAI API](https://beta.openai.com/account/usage) 查询剩余额度。

   不过，我限定了回答的字数，并且用的是不那么贵的 `curie` 模型（用它还有个原因是最厉害的 `davinci`  模型话实在是太多了），所以花不了多少钱，18 刀绰绰有余。

2. 安装 `Node.js` ，方法也自行研究吧😶‍🌫️



### 使用步骤

1. 克隆本仓库，找到仓库根目录下的 `config.yaml` 并打开

2. 打开课程的热门讨论页面，就是这个

   ![image-20221228153929921.png](https://bj.bcebos.com/baidu-rmb-video-cover-1/e159c8ee909f8829e31335476a20e777.png)

   这时看网址，应该类似这样

   ![image-20221228142757474.png](https://bj.bcebos.com/baidu-rmb-video-cover-1/70438a033a5ac7ebf7214e82301daf0a.png)

   找到自己你的课程的 `courseId` 和 `recruitId` ，填入第一步打开的 `config.yaml`

3. 在课程回答页面右键，选择检查

   ![image-20221228143341912.png](https://bj.bcebos.com/baidu-rmb-video-cover-1/a82ab90156be82cbc6c414caa053a8aa.png)

   找到 `应用程序` 选项卡，在左侧找到 `Cookie` 下的 `https://qah5.zhihuishu.com` ，在右侧找到 `jt-cas` ，将它的值填入 `config.yaml`

4. 将 [前期准备](#前期准备) 环节申请到的 `API Key` 填入 `config.yaml`

5. 想想你准备回答几题，一页是 `50` 题，将起始页数 `from` 和终止页数 `to` 填入 `config.yaml` 

5. 如果你有同学互相点赞刷分，可以将他们的 `jt-cas` 填入 `config.yaml` 中的 `viceWisdomtreeJtCasList` ，将会自动点赞

5. 保存  `config.yaml` 

6. 打开终端，导航到根目录，执行 `npm i`

7. 执行 `npm start` ，然后就好啦😋



## todo（大概率会鸽🤥）

- [ ] 实现二维码登录



## 最后

欢迎提 [issue](https://github.com/JiunnTarn/wisdomtree_auto_discuss/issues) 

