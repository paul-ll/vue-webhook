#!/bin/bash
WORK_PATH='/usr/projects/vue-front'
cd $WORK_PATH
echo "清理代码"
git reset --hard origin/master
git clean -f
echo "拉取最新代码"
git pull origin master
echo "打包最新代码"
npm install
npm run build
echo "开始构建镜像"
docker build -t vue-front:1.0 .
echo "删除旧容器"
docker stop vue-front-container
docker rm vue-front-container
echo "启动新容器"
docker container run -p 8099:8099 -d --name vue-front-container vue-front:1.0