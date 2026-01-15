/*!
 * sheet-draggable
 * https://github.com/yomotsu/sheet-draggable
 * (c) 2017 @yomotsu
 * Released under the MIT License.
 */
const showEvent = new CustomEvent('show');
const hideEvent = new CustomEvent('hide');
class SheetDraggable extends EventTarget {
    constructor(element, { side = 'bottom', handle = null, dismissThreshold = 64, dragThreshold = 5 }) {
        super();
        this.handle = null;
        this.dragTarget = null;
        this.element = element;
        this.side = side;
        this.handle = handle;
        this.dismissThreshold = dismissThreshold;
        this.dragThreshold = dragThreshold;
        const dragDelta = { x: 0, y: 0 };
        const dragAccumulator = { x: 0, y: 0 };
        const dragLastCoords = { x: 0, y: 0 };
        let isDragActive = false;
        const dragCancel = () => {
            this.resetEvents();
            this.revertDragMode();
        };
        const hide = () => {
            this.hide();
        };
        const revert = () => {
            this.showInternal();
            this.revertDragMode();
        };
        const dragEnd = () => {
            this.resetEvents();
            switch (this.side) {
                case 'bottom': {
                    if (dragAccumulator.y >= this.dismissThreshold) {
                        hide();
                    }
                    else {
                        revert();
                    }
                    break;
                }
                case 'top': {
                    if (-dragAccumulator.y >= this.dismissThreshold) {
                        hide();
                    }
                    else {
                        revert();
                    }
                    break;
                }
                case 'right': {
                    if (dragAccumulator.x >= this.dismissThreshold) {
                        hide();
                    }
                    else {
                        revert();
                    }
                    break;
                }
                case 'left': {
                    if (-dragAccumulator.x >= this.dismissThreshold) {
                        hide();
                    }
                    else {
                        revert();
                    }
                    break;
                }
            }
            dragDelta.x = 0;
            dragDelta.y = 0;
            dragAccumulator.x = 0;
            dragAccumulator.y = 0;
            isDragActive = false;
        };
        const drag = (event) => {
            if (!this.dragTarget) {
                dragEnd();
                return;
            }
            const isTouchEvent = 'touches' in event;
            if (isTouchEvent && event.touches.length > 1)
                return;
            const _event = isTouchEvent ? event.touches.item(0) : event;
            if (!_event) {
                dragEnd();
                return;
            }
            dragDelta.x = _event.clientX - dragLastCoords.x;
            dragDelta.y = _event.clientY - dragLastCoords.y;
            dragAccumulator.x += dragDelta.x;
            dragAccumulator.y += dragDelta.y;
            dragLastCoords.x = _event.clientX;
            dragLastCoords.y = _event.clientY;
            const draggingDirectionY = dragDelta.y > 0 ? 'down' :
                dragDelta.y < 0 ? 'up' :
                    null;
            const draggingDirectionX = dragDelta.x > 0 ? 'right' :
                dragDelta.x < 0 ? 'left' :
                    null;
            if ((this.side === 'bottom' || this.side === 'top') && draggingDirectionY === null)
                return;
            if ((this.side === 'right' || this.side === 'left') && draggingDirectionX === null)
                return;
            if (!isDragActive && isTouchEvent) {
                const _isScrollEdge = isScrollEdge(this.dragTarget, this.side);
                if ((this.side === 'bottom' && draggingDirectionY === 'down' && !_isScrollEdge) ||
                    (this.side === 'bottom' && draggingDirectionY === 'up') ||
                    (this.side === 'top' && draggingDirectionY === 'up' && !_isScrollEdge) ||
                    (this.side === 'top' && draggingDirectionY === 'down') ||
                    (this.side === 'right' && draggingDirectionX === 'right' && !_isScrollEdge) ||
                    (this.side === 'right' && draggingDirectionX === 'left') ||
                    (this.side === 'left' && draggingDirectionX === 'left' && !_isScrollEdge) ||
                    (this.side === 'left' && draggingDirectionX === 'right')) {
                    dragCancel();
                    return;
                }
            }
            event.preventDefault();
            if (!isDragActive) {
                switch (this.side) {
                    case 'bottom':
                    case 'top': {
                        if (Math.abs(dragAccumulator.x) >= this.dragThreshold) {
                            dragCancel();
                            return;
                        }
                        if (Math.abs(dragAccumulator.y) < this.dragThreshold)
                            return;
                        break;
                    }
                    case 'right':
                    case 'left': {
                        if (Math.abs(dragAccumulator.y) >= this.dragThreshold) {
                            dragCancel();
                            return;
                        }
                        if (Math.abs(dragAccumulator.x) < this.dragThreshold)
                            return;
                        break;
                    }
                }
                isDragActive = true;
                dragAccumulator.x = 0;
                dragAccumulator.y = 0;
            }
            switch (this.side) {
                case 'bottom': {
                    this.element.style.transform = `translateY(${Math.max(0, dragAccumulator.y)}px)`;
                    break;
                }
                case 'top': {
                    this.element.style.transform = `translateY(${Math.min(0, dragAccumulator.y)}px)`;
                    break;
                }
                case 'right': {
                    this.element.style.transform = `translateX(${Math.max(0, dragAccumulator.x)}px)`;
                    break;
                }
                case 'left': {
                    this.element.style.transform = `translateX(${Math.min(0, dragAccumulator.x)}px)`;
                    break;
                }
            }
        };
        const dragStart = (event) => {
            dragCancel();
            clearTimeout(this.hideTimeoutId);
            if (!(event.target instanceof HTMLElement))
                return;
            const isTouchEvent = 'touches' in event;
            if (isTouchEvent && event.touches.length > 1)
                return;
            const _event = isTouchEvent ? event.touches.item(0) : event;
            if (!_event)
                return;
            dragLastCoords.x = _event.clientX;
            dragLastCoords.y = _event.clientY;
            dragDelta.x = 0;
            dragDelta.y = 0;
            dragAccumulator.x = 0;
            dragAccumulator.y = 0;
            this.dragTarget = event.target;
            this.applyDragMode();
            document.addEventListener('mousemove', drag);
            document.addEventListener('touchmove', drag, { passive: false });
            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('touchend', dragEnd);
        };
        const onContextmenu = (event) => {
            event.preventDefault();
        };
        (this.handle || this.element).addEventListener('contextmenu', onContextmenu);
        (this.handle || this.element).addEventListener('mousedown', dragStart);
        (this.handle || this.element).addEventListener('touchstart', dragStart);
        this.resetEvents = () => {
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('mouseup', dragEnd);
            document.removeEventListener('touchend', dragEnd);
        };
        this.detachEvents = () => {
            (this.handle || this.element).removeEventListener('contextmenu', onContextmenu);
            (this.handle || this.element).removeEventListener('mousedown', dragStart);
            (this.handle || this.element).removeEventListener('touchstart', dragStart);
            this.resetEvents();
        };
    }
    showInternal() {
        switch (this.side) {
            case 'bottom':
            case 'top': {
                this.element.style.transform = `translateY(0)`;
                break;
            }
            case 'right':
            case 'left': {
                this.element.style.transform = `translateX(0)`;
                break;
            }
        }
    }
    hideInternal() {
        switch (this.side) {
            case 'bottom': {
                this.element.style.transform = `translateY(100%)`;
                break;
            }
            case 'top': {
                this.element.style.transform = `translateY(-100%)`;
                break;
            }
            case 'right': {
                this.element.style.transform = `translateX(100%)`;
                break;
            }
            case 'left': {
                this.element.style.transform = `translateX(-100%)`;
                break;
            }
        }
    }
    show() {
        this.dispatchEvent(showEvent);
        clearTimeout(this.hideTimeoutId);
        this.resetEvents();
        this.revertDragMode();
        this.showInternal();
    }
    hide() {
        clearTimeout(this.hideTimeoutId);
        this.resetEvents();
        this.element.style.transition = '';
        this.hideTimeoutId = setTimeout(() => {
            this.revertDragMode();
            this.dispatchEvent(hideEvent);
        }, 300);
        this.hideInternal();
    }
    destroy() {
        this.detachEvents();
        this.revertDragMode();
    }
    applyDragMode() {
        this.element.style.transition = 'none';
        this.element.style.userSelect = 'none';
        applyTouchActionNone(this.element);
    }
    revertDragMode() {
        this.element.style.transition = '';
        this.element.style.userSelect = '';
        removeTouchActionNone(this.element);
    }
}
function applyTouchActionNone(element) {
    element.style.touchAction = 'none';
    const children = element.children;
    for (let i = 0; i < children.length; i++) {
        const child = children.item(i);
        if (child instanceof HTMLElement) {
            applyTouchActionNone(child);
        }
    }
}
function removeTouchActionNone(element) {
    element.style.touchAction = '';
    const children = element.children;
    for (let i = 0; i < children.length; i++) {
        const child = children.item(i);
        if (child instanceof HTMLElement) {
            removeTouchActionNone(child);
        }
    }
}
function isScrollEdge(element, side) {
    const checks = {
        'left': () => element.scrollLeft + element.clientWidth >= element.scrollWidth,
        'right': () => element.scrollLeft === 0,
        'top': () => element.scrollTop + element.clientHeight >= element.scrollHeight,
        'bottom': () => element.scrollTop === 0,
    };
    return checks[side]();
}

export { SheetDraggable };
