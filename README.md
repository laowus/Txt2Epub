## vite + vue3 + Electron 基础模版

### 1. 设置 vite 端口号: vite.config.js

    import { defineConfig } from 'vite'
    import vue from '@vitejs/plugin-vue'

    // https://vitejs.dev/config/
    export default defineConfig({
        plugins: [vue()],
        base: './',
        server: { port: 2000 } //这里更改vite 启动端口
    })

### 2. 用法

-   下载项目
    `git clone https://github.com/laowus/electronDemo.git`
-   初始化项目  
    `npm install`

-   开发模式运行  
    `npm run dev`

-   构建打包  
    `npm run dist`

    或者，分步执行  
    `npm run build`  
    `npm run pack`
