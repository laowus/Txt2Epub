// Declare the tabs variable using const
const tabs = [
    {
        name: 'insert', label: '导入',
        btns: [
            { name: 'txt', label: '导入txt', icon: 'icon-txt', color: '#FFB347', fun: 'addTxt' },
            { name: 'epub', label: '导入epub', icon: 'icon-Epub', color: 'green', fun: 'addEpub' }
        ]
    },
    {
        name: 'chapter', label: '章节', btns: [
            {
                name: 'new',
                label: '新建章节',
                icon: 'newChapter',
                fun: 'newChapter'
            },
            {
                name: 'insert',
                label: '插入章节',
                icon: 'insertChapter',
                fun: 'insertChapter'
            }
        ]

    }
];

// Export the tabs variable
export default tabs;