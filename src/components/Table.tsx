/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/ban-types */

import classNames from "classnames";
import Fuse from "fuse.js";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useSize } from "../hooks/useSize";
import "../scss/table.scss";
import Highlighter from "./Highlighter";
import Scrollbar from "./Scrollbar";
import SearchButton from "./SearchButton";

export type RowRenderFn<TRowType> = (row: TRowType) => ReactNode

export type TableColumn<RowType, ValueType = any> = {
  header?: ReactNode
  field?: keyof RowType
  name: TableColumn<RowType>['field'] | string
  getValue?: (a: ValueType) => string
  searchable?: boolean
  render?: RowRenderFn<RowType>
}

export type RowData<RowType> = {
  data: RowType[]
  matches?: (readonly Match[] | undefined)[] | undefined
  remaining: number
}

/**
 * Compatible with Fuse.js API
 */
type RangeTuple = [number, number]
export type Match = {
  indices: ReadonlyArray<RangeTuple>
  key?: string
  value?: string
}



export function arrayData<RowType>(arr: RowType[]): GetDataFn<RowType> {
  let lastFilter: string | null = null;
  let lastOrder: TableColumn<RowType>[] = [];
  let cachedFilterOrder: RowType[] | null = null;
  let matches: RowData<RowType>["matches"] = undefined;
  return async (start: number, rows: number, columns: TableColumn<RowType>[], filter: string | null, order: TableColumn<RowType>[]) => {

    let res: RowType[];


    if (filter && lastFilter === filter && lastOrder === order && cachedFilterOrder) {
      res = cachedFilterOrder;
    } else if (filter) {

      let fuse: Fuse<RowType> = new Fuse(arr, {
        keys: columns.map(c => c.field as string).filter(c => c),
        includeMatches: true
      });


      let sres = fuse.search(filter);
      res = sres.map(sress => arr[sress.refIndex]);
      matches = sres.map(sress => sress.matches);
    } else {
      res = arr;
      matches = undefined;
    }

    return {
      data: res.slice(start, start + rows),
      remaining: res.length - rows - start,
      matches: matches?.slice(start, start + rows)
    }
  }
}
export type GetDataFn<RowType> = (start: number, rows: number, columns: TableColumn<RowType>[], filter: string | null, order: TableColumn<RowType>[]) => Promise<RowData<RowType>>
export type TableProps<RowType> = {
  getData: GetDataFn<RowType>
  className?: string
  keyProp?: keyof RowType
  columns: TableColumn<RowType>[]
  rows?: number
}
export default function Table<RowType = object>(props: TableProps<RowType>) {
  let containerRef = useRef<HTMLDivElement>(null);
  let size = useSize(containerRef);
  let rows = props.rows ?? (size?.height ?? 0) / 64 + 1;
  let [start, setStart] = useState(0);
  let [rowData, setData] = useState<RowData<RowType | null> | null>(null);
  let [filter, setFilter] = useState<string | null>(null);
  useEffect(() => {
    let running = true;
    props.getData(start, rows, props.columns, filter, [])
      .then((data) => {
        let d = new Array(rows);
        d.fill(null);

        if (running) {

          setData({
            ...data,
            data: [...data.data, ...(d.slice(0, rows - data.data.length))]
          });
        }
      });
    return () => {
      running = false
    };
  }, [props, props.getData, props.columns, rows, start, filter]);
  return <div className="tableable" ref={containerRef}>
    <div className="tbb-r1">
      <table className={classNames(props.className)}>
        <thead>
          <tr>
            <th key="special" style={{}}>
              <SearchButton onSearch={v => setFilter(v)} />
            </th>
            {props.columns?.map(c => <th key={c.name?.toString()}>
              {c.header ?? c.name as string}
            </th>)}
          </tr>
        </thead>
        <tbody>

          {rowData && rowData.data.map((d, i) => <tr key={props.keyProp && d ? d[props.keyProp] + '' : i}>
            <td key="special">

            </td>

            {props.columns?.map(c => d ? <td key={c.name?.toString()}>

              {c.render ? c.render(d) : c.field ? <Highlighter value={d} matches={rowData?.matches?.[i]} column={c.field} /> : null}

            </td> : <td key={c.name?.toString() + ' null'}>&nbsp;</td>)}
          </tr>)}
        </tbody>
      </table>
      <Scrollbar containerRef={containerRef} vertical length={(1 + start + (rowData?.remaining ?? 0))} onPositionChange={row => {
        setStart(row)
      }} />
    </div>
    <div className="tbb-r2">
      <div className="tbb-scrollbar tbb-scrollbar-h">
        <div className="tbb-scrollbar-indicator"></div>
      </div>
    </div>
  </div>
}