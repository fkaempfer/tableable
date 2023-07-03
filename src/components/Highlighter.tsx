/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/ban-types */
import { PropsWithChildren } from "react";
import { Match } from "./Table";

export type HighlighterProps<RowType> = PropsWithChildren & {
  value: RowType
  column: keyof RowType
  matches: readonly Match[] | undefined
}

export default function Highlighter<RowType>(props: HighlighterProps<RowType>) {

  let match = props.matches?.find(m => m.key === props.column);
  let val = props.value[props.column] + '';
  if (!match) {
    return <span key="nohl">{val}</span>
  }
  let last = 0;
  let seams: number[][] = [];


  if (match)
    for (let p of match.indices) {
      seams.push([last, p[0]]);
      seams.push([p[0], last = p[1]+1]);
    }
  if (last < val.length)
    seams.push([last, val.length ])
  return <span key="hl">
    {seams.map((s, i) => <span className={i % 2 === 1 ? 'text-bg-info' : ''}>{val.slice(s[0], s[1])}</span>)}
  </span>
}