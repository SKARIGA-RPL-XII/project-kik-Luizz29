import { createTheme } from "@mui/material/styles";
import { useMemo } from "react";

export function useMuiTheme() {
  const isDark =
    document.documentElement.classList.contains("dark");

  return useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? "dark" : "light",
          background: {
            paper: isDark ? "#09090b" : "#ffffff", // tailux dark bg
          },
        },
        components: {
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 12,
              },
            },
          },
        },
      }),
    [isDark]
  );
}
