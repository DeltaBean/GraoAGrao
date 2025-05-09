import { Table, Tooltip } from "@radix-ui/themes";
import classNames from "classnames";

export interface CustomTableRowProps extends Table.RowProps {
  /**
   * When true, applies hover highlight styles.
   * Defaults to false.
   */
  isHighlightOnHover?: boolean;
}

export function TableRow({
  className,
  isHighlightOnHover = false,
  ...props
}: CustomTableRowProps) {

  return (

    <Table.Row
      className={classNames(
        {
          "hover:shadow-[0_4px_6px_-1px_var(--accent-4),_0_2px_4px_-2px_var(--accent-4)] hover:bg-[var(--gray-4)] duration-300 ease-in-out transition-colors": isHighlightOnHover,
        },
        className
      )}
      {...props}
    />

  );
}
