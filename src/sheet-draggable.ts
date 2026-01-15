export type Side = 'left' | 'right' | 'top' | 'bottom';

export type Options = {
	side?: Side;
	handle?: HTMLElement | null;
	dismissThreshold?: number;
	dragThreshold?: number;
};

const showEvent = new CustomEvent( 'show' );
const hideEvent = new CustomEvent( 'hide' );

export class SheetDraggable extends EventTarget {
	public dismissThreshold: number;
	public dragThreshold: number;
	protected element: HTMLElement;
	protected side: Side;
	protected handle: HTMLElement | null = null;
	protected dragTarget: HTMLElement | null = null;
	protected hideTimeoutId: number | undefined;
	protected resetEvents: () => void;
	protected detachEvents: () => void;

	constructor( element: HTMLElement, { side = 'bottom', handle = null, dismissThreshold = 64, dragThreshold = 5 }: Options ) {

		super();

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

			switch ( this.side ) {
				case 'bottom': {
					if ( dragAccumulator.y >= this.dismissThreshold ) {
						hide();
					} else {
						revert();
					}
					break;
				}

				case 'top': {
					if ( - dragAccumulator.y >= this.dismissThreshold ) {
						hide();
					} else {
						revert();
					}
					break;
				}

				case 'right': {
					if ( dragAccumulator.x >= this.dismissThreshold ) {
						hide();
					} else {
						revert();
					}
					break;
				}

				case 'left': {
					if ( - dragAccumulator.x >= this.dismissThreshold ) {
						hide();
					} else {
						revert();
					}
					break;
				}

			}

			dragDelta.x = 0;;
			dragDelta.y = 0;
			dragAccumulator.x = 0;
			dragAccumulator.y = 0;
			isDragActive = false;

		}

		const drag = ( event: MouseEvent | TouchEvent ) => {

			if ( ! this.dragTarget ) {

				dragEnd();
				return;

			}

			const isTouchEvent = 'touches' in event;

			if ( isTouchEvent && event.touches.length > 1 ) return;

			const _event = isTouchEvent ? event.touches.item( 0 ) : event;

			if ( ! _event ) {

				dragEnd();
				return;

			}

			dragDelta.x = _event.clientX - dragLastCoords.x;
			dragDelta.y = _event.clientY - dragLastCoords.y;
			dragAccumulator.x += dragDelta.x;
			dragAccumulator.y += dragDelta.y;
			dragLastCoords.x = _event.clientX;
			dragLastCoords.y = _event.clientY;

			const draggingDirectionY =
				dragDelta.y > 0 ? 'down' :
				dragDelta.y < 0 ? 'up' :
				null;
			const draggingDirectionX =
				dragDelta.x > 0 ? 'right' :
				dragDelta.x < 0 ? 'left' :
				null;

			// クリック長後で、まだドラッグ方向が決まっていないので、次の pointermove で判定
			if ( ( this.side === 'bottom' || this.side === 'top' ) && draggingDirectionY === null ) return;
			if ( ( this.side === 'right' || this.side === 'left' ) && draggingDirectionX === null ) return;

			if ( ! isDragActive && isTouchEvent ) {

				// タッチイベント、かつ、スクロール可能な要素上で、スクロール方向にドラッグした場合は処理を中断し、スクロールを活かす
				// ただし、スクロール位置が端に達している場合はドラッグ処理を継続する。
				const _isScrollEdge = isScrollEdge( this.dragTarget, this.side );

				// ドラッグ方向を判定して、必要に応じて処理を中断する
				if (
					( this.side === 'bottom' && draggingDirectionY === 'down' && ! _isScrollEdge ) ||
					( this.side === 'bottom' && draggingDirectionY === 'up' ) ||
					( this.side === 'top' && draggingDirectionY === 'up' && ! _isScrollEdge ) ||
					( this.side === 'top' && draggingDirectionY === 'down' ) ||
					( this.side === 'right' && draggingDirectionX === 'right' && ! _isScrollEdge ) ||
					( this.side === 'right' && draggingDirectionX === 'left' ) ||
					( this.side === 'left' && draggingDirectionX === 'left' && ! _isScrollEdge ) ||
					( this.side === 'left' && draggingDirectionX === 'right' )
				) {

					dragCancel();
					return;

				}

			}

			event.preventDefault();

			if ( ! isDragActive ) {

				// ドラッグ方向ではない方向に対して、閾値以上の移動があった場合はドラッグを開始しない
				switch ( this.side ) {
					case 'bottom':
					case 'top': {
						if ( Math.abs( dragAccumulator.x ) >= this.dragThreshold ) {

							dragCancel();
							return;

						}

						if ( Math.abs( dragAccumulator.y ) < this.dragThreshold ) return;

						break;
					}
					case 'right':
					case 'left': {
						if ( Math.abs( dragAccumulator.y ) >= this.dragThreshold ) {

							dragCancel();
							return;

						}

						if ( Math.abs( dragAccumulator.x ) < this.dragThreshold ) return;

						break;
					}
				}

				// finally, start dragging
				isDragActive = true;
				dragAccumulator.x = 0;
				dragAccumulator.y = 0;

			}

			switch ( this.side ) {
				case 'bottom': {
					this.element.style.transform = `translateY(${ Math.max( 0, dragAccumulator.y ) }px)`;
					break;
				}
				case 'top': {
					this.element.style.transform = `translateY(${ Math.min( 0, dragAccumulator.y ) }px)`;
					break;
				}
				case 'right': {
					this.element.style.transform = `translateX(${ Math.max( 0, dragAccumulator.x ) }px)`;
					break;
				}
				case 'left': {
					this.element.style.transform = `translateX(${ Math.min( 0, dragAccumulator.x ) }px)`;
					break;
				}

			}

		}

		const dragStart = ( event: MouseEvent | TouchEvent ) => {

			dragCancel();
			clearTimeout( this.hideTimeoutId );

			if ( ! ( event.target instanceof HTMLElement ) ) return;

			const isTouchEvent = 'touches' in event;

			if ( isTouchEvent && event.touches.length > 1 ) return;

			const _event = isTouchEvent ? event.touches.item( 0 ) : event;

			if ( ! _event ) return;

			dragLastCoords.x = _event.clientX;
			dragLastCoords.y = _event.clientY;
			dragDelta.x = 0;
			dragDelta.y = 0;
			dragAccumulator.x = 0;
			dragAccumulator.y = 0;
			this.dragTarget = event.target;

			this.applyDragMode();

			document.addEventListener( 'mousemove', drag );
			document.addEventListener( 'touchmove', drag, { passive: false } );
			document.addEventListener( 'mouseup', dragEnd );
			document.addEventListener( 'touchend', dragEnd );

		};

		const onContextmenu = ( event: MouseEvent ) => {

			event.preventDefault();

		};

		// スクロールと共存するためには、pointercancel が邪魔なので、pointerevent を使わない
		( this.handle || this.element ).addEventListener( 'contextmenu', onContextmenu );
		( this.handle || this.element ).addEventListener( 'mousedown', dragStart );
		( this.handle || this.element ).addEventListener( 'touchstart', dragStart );

		this.resetEvents = () => {

			document.removeEventListener( 'mousemove', drag );
			document.removeEventListener( 'touchmove', drag );
			document.removeEventListener( 'mouseup', dragEnd );
			document.removeEventListener( 'touchend', dragEnd );

		};

		this.detachEvents = () => {

			( this.handle || this.element ).removeEventListener( 'contextmenu', onContextmenu );
			( this.handle || this.element ).removeEventListener( 'mousedown', dragStart );
			( this.handle || this.element ).removeEventListener( 'touchstart', dragStart );
			this.resetEvents();

		};
	}

	protected showInternal(): void {

		switch ( this.side ) {
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

	protected hideInternal(): void {

		switch ( this.side ) {
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

	public show(): void {

		this.dispatchEvent( showEvent );

		clearTimeout( this.hideTimeoutId );

		this.resetEvents();
		this.revertDragMode();
		this.showInternal();

	}

	public hide(): void {

		clearTimeout( this.hideTimeoutId );

		this.resetEvents();
		this.element.style.transition = '';
		this.hideTimeoutId = setTimeout( () => {

			this.revertDragMode();
			this.dispatchEvent( hideEvent );

		}, 300 );

		this.hideInternal();

	}

	public destroy(): void {

		this.detachEvents();
		this.revertDragMode();

	}

	protected applyDragMode(): void {

		this.element.style.transition = 'none';
		this.element.style.userSelect = 'none';
		applyTouchActionNone( this.element );

	}

	protected revertDragMode(): void {

		this.element.style.transition = '';
		this.element.style.userSelect = '';
		removeTouchActionNone( this.element );

	}
}

function applyTouchActionNone( element: HTMLElement ): void {

	element.style.touchAction = 'none';

	const children = element.children;
	for ( let i = 0; i < children.length; i ++ ) {
		const child = children.item( i );
		if ( child instanceof HTMLElement ) {
			applyTouchActionNone( child );
		}
	}

}

function removeTouchActionNone( element: HTMLElement ): void {

	element.style.touchAction = '';

	const children = element.children;
	for ( let i = 0; i < children.length; i ++ ) {
		const child = children.item( i );
		if ( child instanceof HTMLElement ) {
			removeTouchActionNone( child );
		}
	}

}

function isScrollEdge( element: HTMLElement, side: Side ): boolean {

	const checks = {
		'left': () => element.scrollLeft + element.clientWidth >= element.scrollWidth,
		'right': () => element.scrollLeft === 0,
		'top': () => element.scrollTop + element.clientHeight >= element.scrollHeight,
		'bottom': () => element.scrollTop === 0,
	} satisfies Record<Side, () => boolean>;

	return checks[ side ]();

}
