// Touch Drag & Drop Polyfill
// 將 Touch Events 轉換為 Drag & Drop Events
// 只要喺遊戲既 <script> 入面加這句：enableTouchDrag();

function enableTouchDrag() {
    let touchedElement = null;
    let touchOffsetX = 0;
    let touchOffsetY = 0;
    
    // 處理 touchstart
    document.addEventListener('touchstart', function(e) {
        const target = e.target.closest('[draggable="true"]');
        if (target) {
            e.preventDefault(); // 防止 scroll
            touchedElement = target;
            
            const touch = e.touches[0];
            const rect = target.getBoundingClientRect();
            touchOffsetX = touch.clientX - rect.left;
            touchOffsetY = touch.clientY - rect.top;
            
            // 模擬 dragstart
            const dragEvent = new DragEvent('dragstart', {
                bubbles: true,
                cancelable: true,
                dataTransfer: new DataTransfer()
            });
            target.dispatchEvent(dragEvent);
            
            // Add visual feedback
            target.style.opacity = '0.5';
            target.classList.add('dragging');
        }
    }, { passive: false });
    
    // 處理 touchmove
    document.addEventListener('touchmove', function(e) {
        if (touchedElement) {
            e.preventDefault();
            const touch = e.touches[0];
            
            // 模擬 dragover
            const dragOverEvent = new DragEvent('dragover', {
                bubbles: true,
                cancelable: true,
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            
            // 嘗試搵到 drop zone
            const dropZones = document.querySelectorAll('.drop-zone, [data-drop], .target');
            dropZones.forEach(zone => {
                const rect = zone.getBoundingClientRect();
                if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    zone.dispatchEvent(new MouseEvent('mouseenter', {
                        bubbles: true,
                        clientX: touch.clientX,
                        clientY: touch.clientY
                    }));
                    zone.classList.add('hover');
                } else {
                    zone.classList.remove('hover');
                }
            });
        }
    }, { passive: false });
    
    // 處理 touchend
    document.addEventListener('touchend', function(e) {
        if (touchedElement) {
            const touch = e.changedTouches[0];
            
            // 模擬 dragend
            const dragEndEvent = new DragEvent('dragend', {
                bubbles: true,
                cancelable: true
            });
            touchedElement.dispatchEvent(dragEndEvent);
            
            // 搵 drop zone 並觸發 drop
            const dropZones = document.querySelectorAll('.drop-zone, [data-drop], .target');
            dropZones.forEach(zone => {
                const rect = zone.getBoundingClientRect();
                if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    
                    // 觸發 drop event
                    const dropEvent = new DragEvent('drop', {
                        bubbles: true,
                        cancelable: true,
                        clientX: touch.clientX,
                        clientY: touch.clientY
                    });
                    zone.dispatchEvent(dropEvent);
                }
                zone.classList.remove('hover');
            });
            
            // 恢復視覺效果
            touchedElement.style.opacity = '1';
            touchedElement.classList.remove('dragging');
            touchedElement = null;
        }
    });
}

// 另一個方法：直接將 click/tap 變成拖曳效果
// 適用於需要拖住移動既遊戲
function enableTouchAsDrag(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    let activeElement = null;
    let startX, startY, initialLeft, initialTop;
    
    container.addEventListener('touchstart', function(e) {
        const target = e.target.closest('.draggable, [draggable="true"], .word-card, .card');
        if (target) {
            e.preventDefault();
            activeElement = target;
            
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            
            const rect = target.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            initialLeft = rect.left - containerRect.left;
            initialTop = rect.top - containerRect.top;
            
            target.classList.add('touch-dragging');
        }
    }, { passive: false });
    
    container.addEventListener('touchmove', function(e) {
        if (activeElement) {
            e.preventDefault();
            const touch = e.touches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            
            activeElement.style.position = 'absolute';
            activeElement.style.left = (initialLeft + deltaX) + 'px';
            activeElement.style.top = (initialTop + deltaY) + 'px';
            activeElement.style.zIndex = '1000';
        }
    }, { passive: false });
    
    container.addEventListener('touchend', function(e) {
        if (activeElement) {
            const touch = e.changedTouches[0];
            
            // 檢查是否放在有效的 drop zone
            const dropZones = document.querySelectorAll('.drop-zone, .target-zone');
            dropZones.forEach(zone => {
                const rect = zone.getBoundingClientRect();
                if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    
                    // 觸發自定義 drop 事件
                    zone.dispatchEvent(new CustomEvent('touchdrop', {
                        detail: { element: activeElement }
                    }));
                }
            });
            
            activeElement.classList.remove('touch-dragging');
            activeElement = null;
        }
    });
}

// 初始化：如果 detect 到係 mobile/tablet，就自動 enable
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    document.addEventListener('DOMContentLoaded', function() {
        enableTouchDrag();
    });
}
