import React from "react";
import ReactDOM from "react-dom";

import { useReplicantValue } from "common/useReplicant";
import { OnAirToggleButton } from "./lib/OnAirToggleButton";
import {
  Autocomplete,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  ThemeProvider,
} from "@mui/material";
import { nodeCGTheme } from "./lib/nodecg.mui.theme";
import hyperid from "common/fastId";
import {
  ILowerThird,
  TEMPLATE_NAME,
  REPLICANT_NAME,
  REPLICANT_OPTIONS,
  TEMPLATE_DURATION,
} from "common/graphics/ILowerThird";
import { Save } from "@mui/icons-material";
import { usePlaylistInteractions } from "./playlist/usePlaylistInteractions";

const getId = hyperid();

function Dashboard() {
  const [template, setTemplate] = useReplicantValue<ILowerThird>(
    REPLICANT_NAME,
    REPLICANT_OPTIONS
  );

  const TEMPLATE_OVERRIDES: Partial<ILowerThird> = {};

  function toggleOnAir() {
    const isOnAir = !template.onAir;
    setTemplate({
      ...template,
      // Generate a new id when onAir is going to be true
      // This allows us to quickly identify if a given playlist item is playing or if it's a different one
      id: isOnAir ? getId() : template.id,
      onAir: isOnAir,
    });
  }

  const { onSave } = usePlaylistInteractions(
		REPLICANT_NAME,
		TEMPLATE_NAME,
		template
	);

  return (
		<ThemeProvider theme={nodeCGTheme}>
			<Grid container spacing={1}>
				<Grid item xs={12}>
					<TextField
						id="line1"
						label="Linia 1"
						size="small"
						fullWidth
						value={template.values.line1}
						helperText="Imię Nazwisko"
						onChange={(e) =>
							setTemplate({
								...template,
								...TEMPLATE_OVERRIDES,
								values: {
									...template.values,
									line1: e.target.value,
								},
							})
						}
					/>
				</Grid>
				<Grid item xs={12}>
					<TextField
						id="line2"
						label="Linia 2"
						size="small"
						fullWidth
						value={template.values.line2}
						onChange={(e) =>
							setTemplate({
								...template,
								...TEMPLATE_OVERRIDES,
								values: {
									...template.values,
									line2: e.target.value,
								},
							})
						}
					/>
				</Grid>
				<Grid item xs={6}>
					<OnAirToggleButton
						onAir={template.onAir}
						onClick={toggleOnAir}
						duration={TEMPLATE_DURATION}
					/>
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
