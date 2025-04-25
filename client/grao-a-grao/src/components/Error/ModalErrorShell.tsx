// components/ModalForm.tsx
"use client";

import { ReactNode } from "react";
import { Card, Flex, Box, Heading, IconButton, Button, Section, Container } from "@radix-ui/themes";
import { ExclamationCircleIcon } from "@heroicons/react/16/solid";

type ModalErrorShellProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export default function ModalErrorShell({ title, onClose, children }: ModalErrorShellProps) {
  return (
    <div className="fixed inset-0 bg-[var(--color-overlay)] z-50">
      <Flex direction="column" align="center" justify="center" className="w-full h-full">
        <Card className="sm:w-4/10 max-h-[80vh] flex flex-col" style={{ paddingTop: "0px", paddingLeft: "0px", paddingRight: "0px" }}>
          <Box>
            <Container py="5" mb="3" className="bg-[var(--gray-4)]" style={{ borderTopLeftRadius: "var(--radius-3)", borderTopRightRadius: "var(--radius-3)" }} >
              <Flex justify={"center"} align={"center"}>
                <ExclamationCircleIcon color="crimson" height="64" width="64" />
              </Flex>
            </Container>
          </Box>
          <Container px="3">
            <Flex justify="center" align="center" p={{ sm: "3" }} mb={{ sm: "2" }}>
              <Heading>{title}</Heading>
            </Flex>

            <Box id="form-content-box" className="sm:px-6 sm:pt-2 flex-1">
              <Flex id="form-content-flex" className="min-h-0 flex-1" direction="column" gap="4" justify={"center"} align={"center"}>
                {children}
                <Flex justify="center" align="center" className="mb-3 mt-5">
                  <Button size="3" color="red" onClick={(e) => { e.preventDefault(); onClose(); }}>
                    Close
                  </Button>
                </Flex>
              </Flex>
            </Box>
          </Container>
        </Card>
      </Flex>
    </div>
  );
}
