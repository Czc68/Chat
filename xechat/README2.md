## 项目历程
#### 4.16

进行项目前端页面的优化，使用组件进行配置，出行vite报错的情况，frontpage界面没有与后端登录联系起来

起初前端页面动画没有正确显示，通过 ` src/index.css ` 添加注解

``` css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 建议加上以下代码，确保背景铺满 */
html, body, #root {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
```

对注册页面进行编写，修改了` handlesubmit`函数