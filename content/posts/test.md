+++
date = '2026-04-23T22:26:53+08:00'
draft = false
title = 'Test'
tags = ['test']
+++

## 测试一下博客

这是蒟蒻第一篇博客，目前还没想好写什么 (

使用hugo+github的静态页面托管构建：

- 下载hugo [Release v0.159.2 · gohugoio/hugo](https://github.com/gohugoio/hugo/releases/tag/v0.159.2) 。
- 把hugo.exe根目录添加到系统PATH，之后就可以直接使用hugo命令了。
- 验证 `hugo version` 。
- 创建站点 `hugo new site your-blog`，这样在当前目录下会生成 `your-blog` 目录，这就是hugo源文件，包含主题、网页前端配置、你的文章等。
- 初始化git仓库 `git init` 。
- 创建两个仓库：username/username.github.io(同时也是用于访问博客的域名)，blog(或者其它名字也行)。
- 创建你的第一篇文章 `hugo new posts/test.md` ，更新文章并提交 `git commit -am "msg" -> git push -u origin master` 。默认情况下，每篇文章的 draft 属性为 false 时才能生效。使用 `-D` 以提交草稿。
- 运行 `hugo server -D` ，默认在 `localhost:1313` 启动。
- 所有文章都保存在 `/your-blog/content/posts` 中，之后每次写博客时只需在这里创建/更新文章，再 `git commit, git push` 即可。

- blog用于存放hugo源文件，username.github.io托管静态网页文件。

- 在blog中创建.github/workflow/deploy.yml配置github action，可以将blog仓库的修改同步到username.github.io 。

- 配置deploy.yml

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
            publish_branch: main #你的.github.io仓库分支
            publish_dir: ./public
            commit_message: ${{ github.event.head_commit.message }}
  ```

  > PERSONAL_TOKEN是在仓库settings中创建的repository secrets的name(当然，也可以是其它名字)，对应的secrets就是你的github access token。


- 配置deploy.yml后，github就会自动把blog仓库的更新同步到另一个仓库了。

站点目前还有不少需要改进的，比如点赞、评论之类的功能，之后回来研究吧 。 。

有空回来更新哈哈 。 。 。（手动狗头）
