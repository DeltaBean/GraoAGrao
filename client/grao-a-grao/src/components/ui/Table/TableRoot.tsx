;
import { Table } from "@radix-ui/themes";
import classNames from "classnames";

export function TableRoot({ children, className, ...props }: Table.RootProps) {
  return (
    <Table.Root
      className={classNames("overflow-x-auto w-full", className)}
      {...props}
    >
      {children}
    </Table.Root>
  );
}