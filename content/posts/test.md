+++
date = '2026-04-23T22:26:53+08:00'
draft = false
title = 'Test'

+++

测试一下博客

这是我的第一篇博客，目前还没想好写什么。

这是用hugo+github的静态页面托管构建的：

- 创建两个仓库：username/username.github.io(同时也是用于访问博客的域名)，blog(或者其它名字也行)

- blog用于存放hugo源文件，username.github.io用于存放静态网站文件

- 在blog中创建.github/workflow/deploy.yml配置github action，可以将blog仓库的修改同步到username.github.io

  下面是deploy.yml的基本配置：

  ```yaml
  name: Deploy Hugo site to Pages
  
  on:
    push:
      branches:
        - main #改成自己的blog仓库分支
  
  jobs:
    build-deploy:
      runs-on: ubuntu-latest
      steps:
        - name: Checkout
          uses: actions/checkout@v4
          with:
            submodules: true
            fetch-depth: 0
  
        - name: Setup Hugo
          uses: peaceiris/actions-hugo@v2
          with:
            hugo-version: 'latest'
            extended: true
  
        - name: Build
          run: hugo --minify
  
        - name: Deploy
          uses: peaceiris/actions-gh-pages@v3
          with:
            personal_token: ${{ secrets.PERSONAL_TOKEN }}
            external_repository: username/username.github.io
            publish_branch: main
            publish_dir: ./public
            commit_message: ${{ github.event.head_commit.message }}
  ```

  > PERSONAL_TOKEN是在仓库settings中创建的repository secrets的name(当然，也可以是其它名字)，对应的secrets就是你的github access token。

  说实话，我也是第一次用actions哈哈😅，之前比较少跨仓。

  站点目前还有不少需要完善的，比如评论、点赞之类的功能，之后再回来研究吧。。

有空回来更新哈哈。。（手动狗头）
