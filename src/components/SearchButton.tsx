/* eslint-disable prefer-const */
import { mdiMagnify } from "@mdi/js";
import Icon from "@mdi/react";
import { Button, Form, Overlay, Popover, Tooltip } from "react-bootstrap";
import styles from "../scss/searchButton.module.scss";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { debounce } from "lodash";

export type SearchButtonProps = {
  onSearch?: (text: string | null) => unknown
}
export default function SearchButton(props: SearchButtonProps) {

  const [show, setShow] = useState(false);
  const target = useRef(null);
  let onChange = useMemo(() => debounce((e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    props.onSearch?.(val);
  }, 100), [props]);

  return <div>

    <Button size="sm" variant="outline-secondary" ref={target} onClick={(e) => {
      if (show) {
        props.onSearch?.(null);
      }
      setShow((show) => !show)

    }}>
      <Icon size={.8} path={mdiMagnify} />
    </Button>
    <Overlay target={target.current} show={show} placement="top-start">
      {(props) => (
        <Popover
          {...props}
          autoFocus
        >
          <Form.Control className={styles.searchText} onChange={onChange} autoFocus onBlur={e => {
            if (e.isTrusted) {
              // setShow(false);
            }
          }} />
        </Popover>
      )}
    </Overlay>
  </div>
}