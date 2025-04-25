// components/ModalForm.tsx
"use client";

import { ReactNode } from "react";
import { Card, Flex, Box, Heading, IconButton, Button } from "@radix-ui/themes";
import { XMarkIcon } from "@heroicons/react/16/solid";

type ModalErrorShellProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export default function ModalErrorShell({ title, onClose, children }: ModalErrorShellProps) {
  return (
    <div className="fixed inset-0 bg-[var(--color-overlay)] z-50">
      <Flex direction="column" align="center" justify="center" className="w-full h-full">
        <Card className="sm:w-4/10 max-h-[80vh] flex flex-col">
          <Flex justify="end">
            <IconButton size="1" color="red" variant="soft" onClick={onClose}>
              <XMarkIcon height="16" width="16" />
            </IconButton>
          </Flex>

          <Box p={{ sm: "3" }} mb={{ sm: "2" }}>
            <Heading>{title}</Heading>
          </Box>

          <Box id="form-content-box" className="sm:px-6 sm:pt-2 flex-1">
            <Flex id="form-content-flex" className="min-h-0 flex-1" direction="column" gap="4">
              {children}
              <Flex justify="start" align="center" className="my-3">
                <Button size="3" color="red" onClick={(e) => { e.preventDefault(); onClose(); }}>
                  Close
                </Button>
              </Flex>
            </Flex>
          </Box>
        </Card>
      </Flex>
    </div>
  );
}
