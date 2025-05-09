import { Table } from "@radix-ui/themes";
import classNames from "classnames";

export function TableColumnHeaderCell({ className, ...props }: Table.ColumnHeaderCellProps
) {
  return (
    <Table.ColumnHeaderCell
      className={classNames("border-b", className)}
      {...props}
    />
  );
}
