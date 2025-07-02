// components/ModalForm.tsx
"use client";

import { ReactNode } from "react";
import { Card, Flex, Box, Heading, IconButton, Button } from "@radix-ui/themes";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { motion, AnimatePresence } from "framer-motion";

type ModalFormShellProps = {
  title: string;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: () => void;
  children: ReactNode;
};

export default function ModalFormShell({
  title,
  mode,
  onClose,
  onSubmit,
  children,
}: ModalFormShellProps) {
  return (
    <div className="fixed inset-0 bg-[var(--color-overlay)] z-50">
      <Flex direction="column" align="center" justify="center" className="w-full h-full">
        <AnimatePresence>
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.40, ease: "easeOut" }}
            className="sm:w-4/10 max-h-[80vh] flex flex-col"
          >
            <Card >
              <Flex justify="end">
                <IconButton size="1" color="red" variant="soft" onClick={onClose}>
                  <XMarkIcon height="16" width="16" />
                </IconButton>
              </Flex>

              <Box p={{ sm: "3" }} mb={{ sm: "2" }}>
                <Heading>{mode === "edit" ? "Editar" : "Criar"} {title}</Heading>
              </Box>

              <Box id="form-content-box" className="sm:px-6 sm:pt-2 flex-1">
                <Flex id="form-content-flex" className="min-h-0 flex-1" direction="column" gap="4">
                  {children}
                  <Flex justify="start" align="center" className="my-3">
                    <Button size="3" onClick={(e) => { e.preventDefault(); onSubmit(); }}>
                      {mode === "edit" ? "Editar" : "Criar"}
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            </Card>
          </motion.div>
        </AnimatePresence>
      </Flex>
    </div>
  );
}
