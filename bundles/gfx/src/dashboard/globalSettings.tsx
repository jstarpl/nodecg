import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import { useOnlyReplicantValue, useReplicantValue } from "common/useReplicant";
import {
  Badge,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  TextField,
  ThemeProvider,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import { nodeCGTheme } from "./lib/nodecg.mui.theme";
import hyperid from "common/fastId";
import { Description, Refresh, Scoreboard } from "@mui/icons-material";
import { GoogleSheetsRow, GoogleSheetsStatus } from "common/googleSheets/index";

const getId = hyperid();

const nodecg = window.nodecg;

function GoogleSheetsStatusDisplay() {
  const sheetsStatus = useOnlyReplicantValue<GoogleSheetsStatus>(
    "system:googleSheetsStatus",
    {
      persistent: false,
    }
  );

  const sheetData = useOnlyReplicantValue<GoogleSheetsRow[]>(
    "system:googleSheetsData",
    { defaultValue: [] }
  );

  let status = `OK, ${sheetData.length} rekordów`;
  let color:
    | "error"
    | "warning"
    | "success"
    | "inherit"
    | "disabled"
    | "action"
    | "primary"
    | "secondary"
    | "info"
    | undefined = "success";

  switch (sheetsStatus) {
    case GoogleSheetsStatus.CONSTANT_FAILURE:
      color = "error";
      status = "Brak możliwości pobrania Arkusza";
      break;
    case GoogleSheetsStatus.INVALID_PERMISSIONS:
      color = "error";
      status = "Brak dostępu do Arkusza";
      break;
    case GoogleSheetsStatus.INVALID_URL:
      color = "error";
      status = "Niepoprawny adres URL";
      break;
    case GoogleSheetsStatus.EMPTY_URL:
      color = undefined;
      status = "Brak adresu URL";
      break;
    case GoogleSheetsStatus.UNKNOWN_ERROR:
      color = "error";
      status = "Błąd";
      break;
  }

  return (
    <>
      <Description color={color} sx={{ verticalAlign: "bottom" }} />
      &nbsp;{status}
    </>
  );
}

function GoogleSheetsLastUpdate() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const sheetsLastUpdate = useOnlyReplicantValue<number>(
    "system:googleSheetsLastUpdate",
    {
      defaultValue: 0,
      persistent: false,
    }
  );

  if (sheetsLastUpdate <= 0 || !Number.isFinite(sheetsLastUpdate)) {
    return <>{"Nigdy"}</>;
  }

  const options: Intl.RelativeTimeFormatOptions = {
    localeMatcher: "best fit",
    numeric: "auto",
    style: "short",
  };

  const lastUpdateStr = new Intl.RelativeTimeFormat("pl-PL", options).format(
    Math.floor((sheetsLastUpdate - now) / 1000),
    "seconds"
  );

  return <>{lastUpdateStr}</>;
}

function Dashboard() {
  const [clockResetValue, setClockResetValue] = useReplicantValue<string>(
    "system:clockResetValue",
    {
      defaultValue: "0:00",
    }
  );
  const [clockShowHours, setClockShowHours] = useReplicantValue(
    "system:clockShowHours",
    {
      defaultValue: false,
    }
  );
  const [clockDirection, setClockDirection] = useReplicantValue<number>(
    "system:clockDirection",
    {
      defaultValue: 1,
    }
  );
  const clockRunning = useOnlyReplicantValue<boolean>(
    "system:clockState",
    {
      defaultValue: false,
      persistent: false,
    }
  );
  const [uplinkDelay, setUplinkDelay] = useReplicantValue<number>(
    "scoreboardOCR:uplinkDelay",
    {
      defaultValue: 0,
    }
  );
  const scoreOCRConnected = useOnlyReplicantValue<number>(
    "scoreboardOCR:status",
    {
      defaultValue: 0,
      persistent: false,
    }
  );

  const [sheetsUrl, setSheetsUrl] = useReplicantValue<string>(
    "system:googleSheetsUrl",
    {
      defaultValue: "",
    }
  );

  const [webScraperUrl, setWebScraperUrl] = useReplicantValue<string>(
    "system:webScraperUrl",
    {
      defaultValue: "",
    }
  );

  function onUpdateSheetsNow() {
    nodecg
      .sendMessage("system:googleSheets:refreshNow")
      .then((e) => console.log)
      .catch((e) => console.error);
  }

  function onUpdateWebScraperNow() {
    nodecg
      .sendMessage("system:webScraper:refreshNow")
      .then((e) => console.log)
      .catch((e) => console.error);
  }

  return (
    <ThemeProvider theme={nodeCGTheme}>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Tooltip
            title={
              scoreOCRConnected > 0
                ? "Scoreboard OCR połączony"
                : "Brak Scoreboard OCR"
            }
          >
            <Badge
              color="success"
              invisible={scoreOCRConnected < 1}
              variant="dot"
            >
              <Scoreboard
                sx={{ mr: 2 }}
                color={scoreOCRConnected < 1 ? "disabled" : "inherit"}
              />
            </Badge>
          </Tooltip>
          {scoreOCRConnected > 0
            ? `Scoreboard OCR połączony`
            : "Scoreboard OCR rozłączony"}
        </Grid>
        <Grid item xs={6}>
          <TextField
            id="uplinkDelay"
            label="Opóźnienie dosyłu Scoreboard OCR (sekundy)"
            size="small"
            fullWidth
            value={uplinkDelay}
            inputMode="decimal"
            InputProps={{
              inputProps: {
                type: "number",
                step: 0.1,
                min: 0,
              },
            }}
            onChange={(e) => {
              const newVal = parseFloat(e.target.value);
              if (Number.isNaN(newVal)) return;
              setUplinkDelay(newVal);
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <ToggleButtonGroup
            color="primary"
            value={clockDirection}
            exclusive
            size="small"
            onChange={(e, value) => {
              if (value !== -1 && value !== 1) {
                setClockDirection(1);
                return;
              }
              setClockDirection(value);
            }}
          >
            <ToggleButton value={-1}>Odliczaj w dół</ToggleButton>
            <ToggleButton value={1}>Odliczaj do góry</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid item xs={6}>
          <TextField
            id="clockResetValue"
            label="Stan wyjściowy zegara"
            size="small"
            fullWidth
            value={clockResetValue}
            onChange={(e) => setClockResetValue(e.target.value)}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={clockShowHours}
                size="small"
                onChange={(e, checked) => setClockShowHours(checked)}
              />
            }
            label="Pokaż godziny, jeżeli >= 0 (H:mm:ss)"
          />
        </Grid>
        <Grid item xs={12}>
          <hr />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth variant="standard">
            <InputLabel htmlFor="googleSpreadsheetUrl">
              URL Arkusza Google Spreadsheets
            </InputLabel>
            <Input
              id="googleSpreadsheetUrl"
              type="text"
              size="small"
              value={sheetsUrl}
              onChange={(e) => setSheetsUrl(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <Tooltip title="Odśwież teraz">
                    <IconButton
                      aria-label="Odśwież teraz"
                      onClick={onUpdateSheetsNow}
                    >
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              }
            />
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <GoogleSheetsStatusDisplay />
        </Grid>
        <Grid item xs={6}>
          <GoogleSheetsLastUpdate />
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <hr />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth variant="standard">
          <InputLabel htmlFor="webScraperUrl">URL strony z danymi</InputLabel>
          <Input
            id="webScraperUrl"
            type="text"
            size="small"
            value={webScraperUrl}
            onChange={(e) => setWebScraperUrl(e.target.value)}
            endAdornment={
              <InputAdornment position="end">
                <Tooltip title="Odśwież teraz">
                  <IconButton
                    aria-label="Odśwież teraz"
                    onClick={onUpdateWebScraperNow}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            }
          />
        </FormControl>
      </Grid>
    </ThemeProvider>
  );
}

ReactDOM.render(<Dashboard />, document.getElementById("root"));
