import React from "react";
import ReactDOM from "react-dom";

import { useReplicantValue } from "common/useReplicant";
import {
  Button,
  Grid,
  ThemeProvider,
} from "@mui/material";
import { nodeCGTheme } from "./lib/nodecg.mui.theme";
import hyperid from "common/fastId";
import {
  IScoreBug,
  TEMPLATE_NAME,
  REPLICANT_NAME,
  REPLICANT_OPTIONS,
  TEMPLATE_DURATION,
} from "common/graphics/IScoreBug";
import { Save } from "@mui/icons-material";
import { usePlaylistInteractions } from "./playlist/usePlaylistInteractions";
import { useToggleOnAir } from "./common/useToggleOnAir";

const getId = hyperid();

function Dashboard() {
  const [template, setTemplate] = useReplicantValue<IScoreBug>(
    REPLICANT_NAME,
    REPLICANT_OPTIONS
  );

  const { OnAirToggleButton } = useToggleOnAir(template, setTemplate, TEMPLATE_DURATION) 

  const { onSave } = usePlaylistInteractions(
		REPLICANT_NAME,
		TEMPLATE_NAME,
		template
	);

  return (
    <ThemeProvider theme={nodeCGTheme}>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <OnAirToggleButton />
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Save />}
            onClick={onSave}
          >
            Zapisz
          </Button>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

ReactDOM.render(<Dashboard />, document.getElementById("root"));
