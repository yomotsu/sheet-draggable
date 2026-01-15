export type Side = 'left' | 'right' | 'top' | 'bottom';
export type Options = {
    side?: Side;
    handle?: HTMLElement | null;
    dismissThreshold?: number;
    dragThreshold?: number;
};
export declare class SheetDraggable extends EventTarget {
    dismissThreshold: number;
    dragThreshold: number;
    protected element: HTMLElement;
    protected side: Side;
    protected handle: HTMLElement | null;
    protected dragTarget: HTMLElement | null;
    protected hideTimeoutId: number | undefined;
    protected resetEvents: () => void;
    protected detachEvents: () => void;
    constructor(element: HTMLElement, { side, handle, dismissThreshold, dragThreshold }: Options);
    protected showInternal(): void;
    protected hideInternal(): void;
    show(): void;
    hide(): void;
    destroy(): void;
    protected applyDragMode(): void;
    protected revertDragMode(): void;
}
