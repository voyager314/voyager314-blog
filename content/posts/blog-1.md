+++
date = '2026-04-25T11:26:25+08:00'
draft = false
title = 'Enable PV Count'
tags = ['busuanzi']

+++

由于静态网站的限制，在添加浏览量显示这类动态展示功能时，需要引入第三方服务。

此处，博主采用 [busuanzi](https://www.busuanzi.cc/) 作为提供商，优点是简单快捷，只需引入script脚本即可实现计数功能。

---

## 实现方案

### 涉及文件

| 文件 | 作用 |
|---|---|
| `layouts/partials/post_meta.html` | 覆盖主题元信息模板，添加眼睛图标与计数元素 |
| `layouts/partials/extend_footer.html` | 加载 busuanzi 脚本，格式化数字，控制加载动画 |
| `assets/css/extended/custom.css` | 旋转加载圈与图标样式 |

### 1. 元信息模板（`post_meta.html`）

在原有的日期、阅读时长等信息之后，追加浏览量组件：

```html
<span class="post-pv-wrap" title="浏览量">
  <!-- 眼睛图标 (SVG) -->
  <span class="pv-spinner"></span>          <!-- 加载中旋转圈 -->
  <span id="busuanzi_page_pv" style="display:none"></span>  <!-- 计数值 -->
</span>
```

> **注意**：v3 的元素 ID 是 `busuanzi_page_pv`，与旧版 v2 的 `busuanzi_value_page_pv` **不同**，不可混用。

### 2. 脚本加载（`extend_footer.html`）

```html
<script src="//cdn.busuanzi.cc/busuanzi/3.6.9/busuanzi.abbr.min.js"></script>
```

**脚本必须同步加载（不加 `defer` / `async`）**，原因如下：

v3 脚本内部通过 `document.currentScript.src` 推导 API 地址：

```javascript
const u = new URL(document.currentScript.src);
fetch(u.protocol + '//' + u.host + '/abbr-api.php', ...)
```

浏览器规范规定，`defer` 和 `async` 脚本执行时 `document.currentScript` 恒为 `null`，导致第一行即抛出 `TypeError`，fetch 请求从未发出，页面无任何报错但计数始终不显示。

将脚本放在 `extend_footer.html`（页面底部）而非 `<head>`，可在不阻塞首屏渲染的前提下保持同步加载。

### 3. 数字格式化

busuanzi 回填数值后，通过 `MutationObserver` 拦截并格式化：

```javascript
function formatPV(n) {
  if (n >= 10000) {
    return (n / 10000).toFixed(2).replace(/\.?0+$/, '') + 'w';
  }
  return String(n);
}
// 示例：10150 → "1.02w"，20000 → "2w"，9999 → "9999"
```

加载完成前显示旋转圈，6 秒内无响应则自动隐藏。

---

## 踩坑记录

### 问题：上线后不显示，本地正常

**根因**：脚本标签写了 `defer`，导致 `document.currentScript` 为 `null`，API 请求静默失败。

**解决**：移除 `defer`，将脚本放至页面底部同步执行。

### 问题：元素 ID 写错

**根因**：误用了 v2 的 ID `busuanzi_value_page_pv`，而 v3 API 实际返回的 key 为 `busuanzi_page_pv`。

**解决**：统一改为 `busuanzi_page_pv`。

### 问题：hugo.toml 配置缺失

**解决**：在 `hugo.toml`中手动开启 busuanzi 计数功能

```toml
[busuanzi]
enable = true
```



### 注意事项

- busuanzi v3 **禁止 `localhost` 接入**，本地 `hugo server` 调试时不会显示数字，属正常现象，推送至 GitHub Pages 后生效。

- 域名长度不得超过 22 个字符（`voyager314.github.io` 共 21 字符，在限制内）。

- 必须在 `hugo.toml` 中开启 busuanzi 功能，否则上述配置上线后依然无效！

  - ```toml
    [busuanzi]
    enable = true
    ```

