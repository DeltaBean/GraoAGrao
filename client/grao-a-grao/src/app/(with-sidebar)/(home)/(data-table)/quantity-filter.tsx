"use client"

import {
    Popover,
    Button,
    Flex,
    Text,
    Slider,
    Separator,
    TextField,
    Box,
} from "@radix-ui/themes"
import { Table } from "@tanstack/react-table"
import { StockModel } from "@/types/stock"
import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"

interface QuantityFilterProps {
    table: Table<StockModel>
}

export function QuantityFilter({ table }: QuantityFilterProps) {
    const column = table.getColumn("current_stock");
    // 1) grab the computed facet (min, max)
    const faceted = column?.getFacetedMinMaxValues() ?? [0, 0];
    const [minVal, maxVal] = faceted;

    // 2) store the current slider/filter state as one tuple
    const [[lowerValue, upperValue], setRange] = useState<[number, number]>([
        minVal,
        maxVal,
    ]);

    // 3) whenever the real min/max change (e.g. data loads), reset our slider
    useEffect(() => {
        setRange([minVal, maxVal]);
    }, [minVal, maxVal]);

    // helper to update both state & table filter
    const update = (newRange: [number, number]) => {
        setRange(newRange);
        column?.setFilterValue(newRange);
    };

    const [open, setOpen] = useState(false);

    return (
        <Box>
            <Popover.Root open={open} onOpenChange={setOpen}>
                <Popover.Trigger>
                    <Button variant="soft" size="2" className="flex items-center">
                        Quantidade
                        <ChevronDown
                            width={16}
                            height={16}
                            className={`ml-2 transition-transform ${open ? "rotate-180" : ""}`}
                        />
                    </Button>
                </Popover.Trigger>
                <Popover.Content side="bottom" className="p-4">
                    <Flex direction="column" gap="3">
                        <Text weight="bold">Filtrar por Quantidade</Text>
                        <Separator />
                        <Flex gap="2" align="center">
                            <TextField.Root
                                placeholder="Mínimo"
                                value={lowerValue}
                                onChange={(e) => {
                                    const v = Number(e.target.value) || minVal;
                                    update([v, upperValue]);
                                }}
                            />
                            <Text size="6" weight="medium">–</Text>
                            <TextField.Root
                                placeholder="Máximo"
                                value={upperValue}
                                onChange={(e) => {
                                    const v = Number(e.target.value) || maxVal;
                                    update([lowerValue, v]);
                                }}
                            />
                        </Flex>
                        <Slider
                            value={[lowerValue, upperValue]}
                            min={minVal}
                            max={maxVal}
                            step={1}
                            onValueChange={(vals) => update([vals[0], vals[1]])}
                        />
                    </Flex>
                </Popover.Content>
            </Popover.Root>
        </Box>
    );
}