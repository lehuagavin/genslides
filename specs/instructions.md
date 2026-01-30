# 生成图片提示词

使用浅黄色/红褐色的水彩画风格，走可爱卡通路线，主要角色是一只黄色的可爱的鸭子，类似motherduck的风格

Gen slide 介绍

标题： Gen slide 介绍
要求： 文字显眼，水平/垂直都居中

根据项目代码分别生成 ascii chart:
1.前端架构
2.后端架构
3.数据流图
4.前端技术栈
5.后端技术栈


# 生成图片风格2

使用钢笔淡彩风格，手绘插画，信息图表，色彩清新（蓝色、绿色、砖红色为主），细节丰富，可爱且具有教育意义，主要角色是一只可爱的小狗

# deploy

新增支持docker compose部署。
新增Makefile，支持make deploy：重新编译并部署；make build：重新编译；make restart 重启；make logs查看日志；每个命令支持可选的SERVICE=frontend|backend，对单个服务进行操作；make status查看所有服务状态；make help