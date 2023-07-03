/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/no-empty-function */
import classNames from "classnames";
import { debounce } from "lodash";
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../scss/scrollbar.scss";

let activeDrag: HTMLDivElement | null = null
/* eslint-disable prefer-const */
export type ScrollbarProps = {
  length?: number
  vertical?: boolean
  onPositionChange?: (position: number) => any
  containerRef?: RefObject<HTMLElement>
}
export default function Scrollbar(props: ScrollbarProps) {
  let len = Math.max(0, Math.floor(props.length ?? 1));
  let indicatorSize = Math.max(1 / (len), .05);
  let indicatorRef = useRef<HTMLDivElement>(null);
  let containerRef = useRef<HTMLDivElement>(null);
  let [dragging, setDragging] = useState(false);
  let [position, setPosition] = useState(0);

  let onWheel = useCallback((e: { deltaY: number, preventDefault: () => any }) => {
    setPosition(p => {
      if (p > 0 && e.deltaY < 0) {
        return (p - 1);
      } else if (p < len - 1 && e.deltaY > 0) {
        return (p + 1);
      }
      return p;
    })

    e.preventDefault();
  }, [len]);
  let moveTo = useCallback((screenY: number) => {
    if (containerRef.current) {
      let rh = (1 / len) * (containerRef.current.clientHeight); // the real indicator height
      let top =
        Math.max(Math.min(
          (screenY - rh / 2 - containerRef.current.offsetTop),
          containerRef.current.clientHeight - rh
        ), 0);
      let pos = Math.round((top / containerRef.current.clientHeight) * len);
      setPosition(pos)
    }
  }, [len])
  let debouncedPositionChange = useMemo(function () {
    return debounce((position: number) => {
      props.onPositionChange?.(position);
    }, 100);
  }, [props]);

  useEffect(() => {
    if (len < position) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setPosition(position = len );
    }
    debouncedPositionChange?.(position);
  }, [position, debouncedPositionChange, len]);
  useEffect(() => {
    let ref = props.containerRef?.current
    if (ref) {
      let startY = 0;
      function onTouchStart(e: TouchEvent) {
        startY = e.touches[0].clientY;
      }
      function onTouchMove(e: TouchEvent) {
        onWheel({
          deltaY: e.touches[0].clientY - startY,
          preventDefault: e.preventDefault
        });
        startY = e.touches[0].clientY;
      }
      ref.addEventListener('wheel', onWheel, {
      })
      ref.addEventListener('touchmove', onTouchMove);
      ref.addEventListener('touchstart', onTouchStart);
      return () => {
        ref!.removeEventListener('wheel', onWheel)
        ref!.removeEventListener('touchmove', onTouchMove)
        ref!.removeEventListener('touchstart', onTouchStart)

      }
    }
  }, [onWheel, props.containerRef])
  useEffect(() => {

    function unDrag() {

      setDragging(false);
      activeDrag = null;
      for (let r of [indicatorRef, containerRef])
        if (r.current) {
          r.current.classList.remove('hover');
          document.documentElement.style.cursor = 'inherit';
        }
    }
    function move(e: MouseEvent) {
      if (activeDrag === containerRef.current && indicatorRef.current && containerRef.current) {
        indicatorRef.current.ondragstart = () => false;
        moveTo(e.clientY);
      }
    }
    let dbm = move;
    document.addEventListener('pointerup', unDrag);
    document.addEventListener('pointermove', dbm);

    return () => {
      document.removeEventListener('pointerup', unDrag);
      document.removeEventListener('pointermove', dbm);
    }
  }, [len, props, props.length, moveTo]);
  return <div hidden={indicatorSize >= 1} ref={containerRef} className={classNames('tbb-scrollbar', props.vertical ? 'tbb-scrollbar-v' : 'tbb-scrollbar-h')}
    onWheel={onWheel} onPointerDown={pe => {
      moveTo(pe.clientY)
      pe.preventDefault();
    }}
  >
    <div className="tbb-scrollbar-indicator"
      style={{ height: `${indicatorSize * 100}%`, top: `${(position) / len * 0.96 * (containerRef.current?.clientHeight ?? 0)}px` }}
      ref={indicatorRef}
      onPointerDown={(e) => {
        setDragging(true);
        activeDrag = containerRef.current;
        for (let r of [indicatorRef, containerRef])
          if (r.current) {
            r.current.classList.add('hover');
            document.documentElement.style.cursor = 'grab';
          }
        e.preventDefault();
      }}
    ></div>
  </div>
}