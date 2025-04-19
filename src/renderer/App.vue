<script setup>
import { ref, onMounted } from 'vue';
const { ipcRenderer } = window.require('electron');
import tabs from './utils/tabs';
import WindowCtr from './components/windowCtr.vue';

const curIndex = ref(0);
const curBtns = ref(tabs[0].btns);
const chapters = ref([]);
// 定义变量存储文件名
const fileName = ref('');
// 定义变量存储分割后的文件内容数组
const fileContentArray = ref([]);

const changeTab = (index) => {
    curIndex.value = index;
    curBtns.value = tabs[index].btns;
}

const addTxt = () => {
    ipcRenderer.invoke('open-file-dialog', 'txt').then((fileInfos) => {
        //获取返回的文件内容
        console.log(fileInfos);
    });
}

const addEpub = () => {
    ipcRenderer.invoke('open-file-dialog', 'epub').then((fileInfos) => {
        console.log(fileInfos);
    });
}
const newChapter = () => {
    console.log(`新建章节`);
}

const insertChapter = () => {
    console.log(`插入章节`);
}


// 定义一个方法用于根据名称调用方法
const callMethodByName = (methodName) => {
    const methods = {
        addTxt,
        addEpub,
        newChapter,
        insertChapter
    };
    if (methods[methodName]) {
        methods[methodName]();
    }
}

onMounted(() => {
    ipcRenderer.on('file-content', (event, { filePath, fileContent }) => {
        console.log('接收到的文件路径:', filePath);
        console.log('接收到的文件内容:', fileContent);
        // 从文件路径中提取文件名
        const path = require('path');
        fileName.value = path.basename(filePath);
        // 通过换行符分割文件内容
        fileContentArray.value = fileContent.split('\n');
    });
});
</script>

<template>
    <div class="container">
        <div class="header">
            <div class="tabs">
                <div class="tabnames">
                    <div class="tabname" v-for="(tab, index) in tabs" :key="index" :class="{ active: curIndex === index }" @click="changeTab(index)">
                        {{ tab.label }}
                    </div>
                    <div class="drag-tab"> </div>
                    <WindowCtr />
                </div>
                <div class="tabcontent">
                    <button class="btn-icon" v-for="(btn, index) in curBtns" @click="callMethodByName(btn.fun)">
                        <span class="iconfont" :class="btn.icon" :style="{ 'color': btn.color }"></span>
                        <span>{{ btn.label }}</span>
                    </button>
                </div>
            </div>
        </div>
        <div class="content">
            <div class="leftMenu" style="overflow-y: auto;">
                <p>{{ fileName }}</p>
                <!-- 这里可以添加更多 leftMenu 内容 -->
            </div>
            <div class="main letter-paper" style="overflow-y: auto;">
                <p v-for="(line, index) in fileContentArray" :key="index">{{ line }}</p>
                <!-- 这里可以添加更多 main 内容 -->
            </div>
        </div>
    </div>

</template>

<style>
.content {
    display: flex;
    flex-direction: row;
    width: 100%;
    /* 设置合适的高度，减去 header 的高度 */
    height: calc(100vh - 120px);
    background-color: #add8e6;
}

.leftMenu {
    width: 200px;
    height: 100%;
    background-color: #f0f0f0;
    border-right: 1px solid #add8e6;
    overflow-y: auto;
    /* 添加垂直滚动条 */
}

.main {
    flex: 1;
    height: 100%;
    background-color: #fff;
    overflow-y: auto;
    /* 调整字体大小，根据实际情况修改 */
    font-size: 1rem;
}

.letter-paper {
    /* 修改为黑色虚线背景 */
    background-image: repeating-linear-gradient(0deg, #ccc, #ccc 1px, transparent 1px, transparent 1.8rem);
    /* 背景线的间距，需要和行高一致 */
    background-size: 100% 1.8rem;
    /* 行高和背景线间距一致 */
    line-height: 1.8rem;
    padding: 0px 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin: 0px;
    /* 确保背景随内容滚动 */
    background-attachment: local;
}

.main p {
    text-decoration: none;
    margin: 0;
    padding: 0;
    /* 垂直居中文字 */
    vertical-align: middle;
}

.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100vh;
    font-size: 12px;
}

.header {
    width: 100%;
    background-color: #f0f0f0;
    display: flex;
    flex-direction: row;
    border: 1px solid #add8e6;
    padding-bottom: 10px;
}

.tabs {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.tabnames {
    width: 100%;
    display: flex;
    flex-direction: row;
    background-color: #87ceeb;
    padding-left: 10px;
    gap: 10px;
}

.tabname {
    width: 50px;
    height: 30px;
    align-items: center;
    justify-content: center;
    display: flex;
}

.tabname.active {
    background-color: white;
    border: 1px solid #87ceeb;
    /* 设置下边框颜色为白色 */
    border-bottom-color: white;
    border-radius: 10px 10px 0 0;
}

.drag-tab {
    flex: 1;
    user-select: none;
    -webkit-app-region: drag;
    -webkit-user-select: none;
}

.tabcontent {
    background-color: white;
    width: 100%;
    height: 70px;
    display: flex;
    flex-direction: row;
    padding: 10px;
}

.btn-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: white;
}

.btn-icon .iconfont {
    font-size: 2rem !important;

}
</style>
