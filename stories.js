// 完成數學故事頁面的JavaScript功能

// 完整的數學故事數據（續）
const mathStories = [
    // ... 前面的故事數據（從HTML中複製）
    {
        id: 13,
        title: "漢諾塔問題",
        category: "算法",
        difficulty: "intermediate",
        difficultyText: "中級",
        content: "漢諾塔是經典的遞歸問題：有三根柱子和n個大小不同的圓盤，從小到大疊在第一根柱子上。規則：1. 每次只能移動一個圓盤，2. 大圓盤不能放在小圓盤上面。最少移動次數：2^n - 1。當n=64時，需要2^64 - 1 ≈ 1.84×10^19次移動。如果每秒移動一次，需要約5850億年！這個問題展示了遞歸思想和指數增長的概念。",
        question: "為什麼漢諾塔的最少移動次數是2^n - 1？",
        status: "available",
        lastSent: null
    },
    {
        id: 14,
        title: "蒙提霍爾問題",
        category: "概率論",
        difficulty: "intermediate",
        difficultyText: "中級",
        content: "著名的概率問題：有三扇門，一扇後面有汽車，兩扇後面有山羊。你選了一扇，主持人打開另一扇有山羊的門，問你是否要換到剩下的那扇門。直覺：換不換都是50%概率，實際：換門的勝率是2/3，不換是1/3。這個問題展示了條件概率和貝葉斯定理，也說明了直覺有時會誤導我們。",
        question: "為什麼換門的勝率更高？如何用概率計算證明？",
        status: "available",
        lastSent: null
    },
    {
        id: 15,
        title: "生日悖論",
        category: "概率論",
        difficulty: "intermediate",
        difficultyText: "中級",
        content: "一個房間裡至少需要多少人，才能使至少有兩人生日相同的概率超過50%？直覺答案：可能需要183人（365/2），實際答案：只需要23人！計算：P(無人生日相同) = 365/365 × 364/365 × ... × (365-n+1)/365，當n=23時，P(有生日相同) ≈ 50.7%。這個悖論說明了組合爆炸和直覺的局限性。",
        question: "為什麼生日悖論的結果如此反直覺？",
        status: "available",
        lastSent: null
    }
];

// 渲染故事卡片
function renderStories(filter = 'all') {
    const container = document.getElementById('stories-container');
    container.innerHTML = '';
    
    // 過濾故事
    const filteredStories = filter === 'all' 
        ? mathStories 
        : mathStories.filter(story => story.category === filter);
    
    // 渲染每個故事
    filteredStories.forEach(story => {
        const card = document.createElement('div');
        card.className = 'story-card';
        card.innerHTML = `
            <div class="story-header">
                <div>
                    <h3 class="story-title">${story.title}</h3>
                    <span class="story-category">${story.category}</span>
                    <span class="story-difficulty difficulty-${story.difficulty}">
                        ${story.difficultyText}
                    </span>
                </div>
                <span class="status status-${story.status}">
                    ${story.status === 'sent' ? '已發送' : '待發送'}
                </span>
            </div>
            
            <div class="story-content">
                ${story.content}
            </div>
            
            <div class="story-question">
                <span class="question-label">思考題：</span>
                ${story.question}
            </div>
            
            <div class="story-meta">
                <span>ID: ${story.id.toString().padStart(2, '0')}</span>
                ${story.lastSent 
                    ? `<span>上次發送: ${story.lastSent}</span>`
                    : '<span>從未發送</span>'
                }
            </div>
        `;
        container.appendChild(card);
    });
    
    // 更新計數
    updateStoryCount(filteredStories.length);
}

// 更新故事計數
function updateStoryCount(count) {
    const title = document.querySelector('h1');
    if (title) {
        const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        const filterText = filter === 'all' ? '' : ` - ${filter}`;
        title.textContent = `📚 數學故事庫${filterText} (${count}個)`;
    }
}

// 初始化過濾器
function initFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有active類
            filterBtns.forEach(b => b.classList.remove('active'));
            // 添加active類到當前按鈕
            btn.classList.add('active');
            // 渲染過濾後的故事
            renderStories(btn.dataset.filter);
        });
    });
}

// 更新同步時間
function updateSyncTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    const timeString = now.toLocaleString('zh-Hant', options).replace(/\//g, '-');
    
    const syncTimeElement = document.getElementById('sync-time');
    if (syncTimeElement) {
        syncTimeElement.textContent = timeString;
    }
}

// 初始化頁面
document.addEventListener('DOMContentLoaded', () => {
    // 渲染所有故事
    renderStories();
    
    // 初始化過濾器
    initFilters();
    
    // 更新同步時間
    updateSyncTime();
    
    // 每分鐘更新一次時間
    setInterval(updateSyncTime, 60000);
    
    // 添加鍵盤快捷鍵
    document.addEventListener('keydown', (e) => {
        // ESC鍵返回首頁
        if (e.key === 'Escape') {
            window.location.href = 'index.html';
        }
    });
});

// 導出函數供其他頁面使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mathStories, renderStories };
}