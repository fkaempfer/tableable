import useResizeObserver from "@react-hook/resize-observer"
import React, {  RefObject } from "react"

export const useSize  = (target: RefObject<HTMLElement>) => {
  const [size, setSize] = React.useState<DOMRect>()

  React.useLayoutEffect(() => {
    setSize(target.current?.getBoundingClientRect())
  }, [target])

  // Where the magic happens
  useResizeObserver(target, (entry) => setSize(entry.contentRect))
  return size
}
