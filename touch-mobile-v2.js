// Universal Mobile Touch Handler
// 將「拖曳」改為「Tap選擇 + Tap放置」
// 自動檢測手機並啟用

(function() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window);
    
    if (!isMobile) return; // Desktop 唔洗
    
    console.log('[Mobile] 啟用觸控模式...');
    
    let selectedElement = null;
    let originalPosition = null;
    
    // 初始化
    function init() {
        // 等待 DOM load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupAllDraggables);
        } else {
            setupAllDraggables();
        }
        
        // Add instruction banner
        setTimeout(showInstruction, 1000);
    }
    
    function setupAllDraggables() {
        // 搵所有 draggable 元素
        const selectors = [
            '[draggable="true"]',
            '.draggable', 
            '.word-card',
            '.word-item',
            '.card[draggable]',
            '.item'
        ];
        
        let draggables = [];
        selectors.forEach(s => {
            document.querySelectorAll(s).forEach(el => draggables.push(el));
        });
        
        // 去重複
        draggables = [...new Set(draggables)];
        
        draggables.forEach(el => {
            // 確保啱既 style
            el.style.cursor = 'pointer';
            el.style.userSelect = 'none';
            el.style.webkitUserSelect = 'none';
            
            // 添加 touch event handlers
            el.addEventListener('touchstart', handleTouchStart, { passive: false });
            el.addEventListener('touchend', handleTouchEnd, { passive: false });
            el.addEventListener('touchmove', handleTouchMove, { passive: false });
        });
        
        // 設置 drop zones
        setupDropZones();
        
        console.log(`[Mobile] 已設置 ${draggables.length} 個可拖動元素`);
    }
    
    function handleTouchStart(e) {
        e.preventDefault();
        
        // 如果已經有選中既，先取消
        if (selectedElement && selectedElement !== this) {
            deselectElement();
        }
        
        selectedElement = this;
        selectedElement.classList.add('mobile-selected');
        
        // 記錄原始位置
        const rect = this.getBoundingClientRect();
        originalPosition = {
            left: this.style.left,
            top: this.style.top,
            position: this.style.position
        };
        
        // Visual feedback
        this.style.transform = 'scale(1.1)';
        this.style.zIndex = '1000';
        this.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
        
        showSelectedFeedback();
    }
    
    function handleTouchMove(e) {
        e.preventDefault();
        // Touch move 時代替 drag
    }
    
    function handleTouchEnd(e) {
        e.preventDefault();
        
        if (!selectedElement) return;
        
        const touch = e.changedTouches[0];
        
        // 搵到 touch 既位置
        const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (elementAtPoint) {
            // 搵 drop zone
            const dropZone = elementAtPoint.closest('.drop-zone, .target, [data-drop], .slot, .match-target');
            
            if (dropZone) {
                // 成功放置！
                handleDrop(selectedElement, dropZone);
                return;
            }
            
            // 檢查係咪另一個 draggable（交換用）
            const anotherDraggable = elementAtPoint.closest('[draggable="true"], .draggable, .word-card, .word-item');
            if (anotherDraggable && anotherDraggable !== selectedElement) {
                handleSwap(selectedElement, anotherDraggable);
                return;
            }
        }
        
        // 冇放到，cancel
        cancelSelection();
    }
    
    function handleDrop(element, dropZone) {
        // 觸發 custom drop event
        const dropEvent = new CustomEvent('mobile-drop', {
            bubbles: true,
            detail: { 
                element: element,
                zone: dropZone
            }
        });
        dropZone.dispatchEvent(dropEvent);
        
        // 嘗試 standard drop event
        try {
            dropZone.dispatchEvent(new Event('drop', { bubbles: true }));
        } catch(e) {}
        
        // 清除選擇
        element.style.transform = '';
        element.style.zIndex = '';
        element.style.boxShadow = '';
        element.classList.remove('mobile-selected');
        selectedElement = null;
        
        showSuccessFeedback();
    }
    
    function handleSwap(el1, el2) {
        // 交換兩個元素既位置
        const swapEvent = new CustomEvent('mobile-swap', {
            bubbles: true,
            detail: { 
                element1: el1, 
                element2: el2 
            }
        });
        el2.dispatchEvent(swapEvent);
        
        el1.style.transform = '';
        el1.style.zIndex = '';
        el1.classList.remove('mobile-selected');
        selectedElement = null;
    }
    
    function cancelSelection() {
        if (selectedElement) {
            selectedElement.style.transform = '';
            selectedElement.style.zIndex = '';
            selectedElement.style.boxShadow = '';
            selectedElement.classList.remove('mobile-selected');
            selectedElement = null;
        }
    }
    
    function deselectElement() {
        cancelSelection();
    }
    
    function setupDropZones() {
        const zoneSelectors = [
            '.drop-zone',
            '.target', 
            '[data-drop]',
            '.slot',
            '.match-target'
        ];
        
        let zones = [];
        zoneSelectors.forEach(s => {
            document.querySelectorAll(s).forEach(z => zones.push(z));
        });
        
        zones = [...new Set(zones)];
        
        zones.forEach(zone => {
            zone.style.cursor = 'pointer';
        });
    }
    
    function showInstruction() {
        // 移除舊既
        const old = document.getElementById('mobile-instruction');
        if (old) old.remove();
        
        const banner = document.createElement('div');
        banner.id = 'mobile-instruction';
        banner.innerHTML = '📱 手機模式：<b>Tap選擇</b> → <b>Tap目標放置</b>';
        banner.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 14px;
            z-index: 99999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            animation: slideDown 0.5s ease;
            text-align: center;
        `;
        document.body.appendChild(banner);
        
        // 3秒後淡出
        setTimeout(() => {
            banner.style.transition = 'opacity 1s';
            banner.style.opacity = '0';
            setTimeout(() => banner.remove(), 1000);
        }, 3000);
        
        // Add animation style
        if (!document.getElementById('mobile-anim-style')) {
            const style = document.createElement('style');
            style.id = 'mobile-anim-style';
            style.textContent = `
                @keyframes slideDown {
                    from { transform: translateX(-50%) translateY(-100px); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
                .mobile-selected {
                    outline: 3px solid #ffd700 !important;
                    outline-offset: 2px;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function showSelectedFeedback() {
        // 可以加 sound 或 vibration
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }
    
    function showSuccessFeedback() {
        if (navigator.vibrate) {
            navigator.vibrate([10, 50, 10]);
        }
    }
    
    // 啟動
    init();
})();
