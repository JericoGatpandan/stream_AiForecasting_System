import type { PaletteColorOptions, TypeBackground, TypeText } from "@mui/material/styles";

declare module "@mui/material/styles" {
    interface PaletteColor {
        [key: number]: string;
    }

    interface TypeBackground {
        overlay?: string;
        mapOverlay?: string;
    }

    interface TypeText {
        onDark?: string;
        onLight?: string;
    }

    interface Palette {
        tertiary: PaletteColor;
    }

    interface PaletteOptions {
        tertiary?: PaletteColorOptions;
    }

    // Extend the theme's breakpoint tokens
    interface BreakpointOverrides {
        xs: true;
        sm: true;
        md: true;
        lg: true;
        xl: true;
    }
}
