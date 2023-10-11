import { AddCircle, RemoveCircle } from "@mui/icons-material";
import {
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
} from "@mui/material";
import React from "react";

function applyDeltaToString(
  value: string | undefined,
  delta: number,
  noClamp?: boolean
): string {
  const valueAsNumber = Number.parseInt(value ?? "0") || 0;
  return String(
    noClamp ? valueAsNumber + delta : Math.max(0, valueAsNumber + delta)
  );
}

export function PlusMinusTextField({
  id,
  label,
  value,
  delta,
  color,
  size,
  showMinus,
  allowNegative,
  onChange,
}: {
  id?: string;
  label: string;
  value?: string;
  size?: "small" | "medium" | undefined;
  delta?: number;
  color?:
    | "inherit"
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
  showMinus?: boolean;
  allowNegative?: boolean;
  onChange:
    | ((
        e:
          | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          | React.MouseEvent<HTMLButtonElement>,
        value: string
      ) => void)
    | undefined;
}) {
  return (
    <FormControl fullWidth variant="standard">
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <Input
        id={id}
        type={"text"}
        size={size}
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange && onChange(e, e.target.value)}
        endAdornment={
          <InputAdornment position="end">
            {showMinus && (
              <IconButton
                aria-label="-1"
                onClick={(e) =>
                  onChange &&
                  onChange(e, applyDeltaToString(value, -1, allowNegative))
                }
              >
                <RemoveCircle />
              </IconButton>
            )}
            <IconButton
              aria-label="+1"
              onClick={(e) =>
                onChange &&
                onChange(
                  e,
                  applyDeltaToString(value, delta ?? 1, allowNegative)
                )
              }
              color={color}
            >
              <AddCircle />
            </IconButton>
          </InputAdornment>
        }
      />
    </FormControl>
  );
}
