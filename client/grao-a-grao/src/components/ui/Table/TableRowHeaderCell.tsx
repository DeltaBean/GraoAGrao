import { Table } from "@radix-ui/themes";
import classNames from "classnames";

export function TableRowHeaderCell({ className, ...props }: Table.RowHeaderCellProps) {
  return (
    <Table.RowHeaderCell
      className={classNames("hover:bg-gray-100 transition-colors", className)}
      {...props}
    />
  );
}
