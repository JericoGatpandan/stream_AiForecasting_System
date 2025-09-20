import type { PaletteColorOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
    interface PaletteColor {
        [key: number]: string;
    }

    interface Palette {
        tertiary: PaletteColor;
    }

    interface PaletteOptions {
        tertiary?: PaletteColorOptions;
    }
}