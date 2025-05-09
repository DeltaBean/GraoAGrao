import { Table } from "@radix-ui/themes";
import classNames from "classnames";

export function TableCell({ className, ...props }: Table.CellProps) {
  return (
    <Table.Cell
      className={classNames("", className)}
      {...props}
    />
  );
}