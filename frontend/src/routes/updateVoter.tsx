import { Voter, VoterResponse } from "../types";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import makeApiRequest from "../util/makeApiRequest";
import Grid from "@mui/material/Grid2";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent, CardHeader,
  CircularProgress, Container,
  Paper,
  styled,
  TextField,
  Typography
} from "@mui/material";
import { InvalidParamsError, ServerError, VoterNotFoundError } from "../apiErrors";
import { DisplayErrorHelper, DisplayErrors } from "../components/errorDisplay";

enum VoterApiState {
  LOADING,
  LOADED,
  ERROR,
}

type VoterStateLoading = {
  state: VoterApiState.LOADING
}

type VoterStateLoaded = {
  state: VoterApiState.LOADED
  voter: Voter
}

type VoterStateError = {
  state: VoterApiState.ERROR
  error: DisplayErrors,
  voter?: Voter
}

type VoterState =
  VoterStateLoading
  | VoterStateLoaded
  | VoterStateError;

const GridRow = styled(Grid)`
    display: flex-wrap;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    //margin: 16px 0;

    & > .MuiFormControl-root {
        margin: 8px;
    }
`

const FormItem = styled(TextField)`margin: 10px;`


function VoterForm({ voter, onChange }: { voter: Voter, onChange: (name: string, value: string) => void }) {
  return (
    <Grid>
      <GridRow>
        <FormItem
          label="First Name"
          value={voter.firstName}
          onChange={(e) => onChange('firstName', e.target.value)}
        />
        <FormItem
          label="Last Name"
          value={voter.lastName}
          onChange={(e) => onChange('lastName', e.target.value)}
        />
        <FormItem
          label="Address 1"
          value={voter.address1}
          onChange={(e) => onChange('address1', e.target.value)}
        />
        <FormItem
          label="Address 2"
          value={voter.address2}
          onChange={(e) => onChange('address2', e.target.value)}
        />
      </GridRow>
      <GridRow>
        <FormItem
          label="City"
          value={voter.city}
          onChange={(e) => onChange('city', e.target.value)}
        />
        <FormItem
          label="State"
          value={voter.state}
          onChange={(e) => onChange('state', e.target.value)}
        />
        <FormItem
          label="Zip"
          value={voter.zip}
          onChange={(e) => onChange('zip', e.target.value)}
        />
      </GridRow>
    </Grid>
  )
}


export function UpdateVoterPage() {
  const [voterState, setVoterState] = useState<VoterState>({ state: VoterApiState.LOADING });
  const params = useParams();
  const navigate = useNavigate();

  const onVoterFieldChange = (field: string, value: string) => {
    setVoterState({
      state: VoterApiState.LOADED,
      voter: {
        ...(voterState as VoterStateLoaded).voter,
        [field]: value
      }
    });
  }

  function goBack(e: React.MouseEvent) {
    e.preventDefault();
    navigate(-1);
  }

  function setErrorState(error: DisplayErrors, voter: Voter | null = null) {
    if (error instanceof VoterNotFoundError) {
      setVoterState({
        state: VoterApiState.ERROR,
        error: error,
      })
    } else if (error instanceof InvalidParamsError && voter) {
      setVoterState({
        state: VoterApiState.ERROR,
        error: error,
        voter: voter
      });
    } else if (error instanceof ServerError) {
      setVoterState({
        state: VoterApiState.ERROR,
        error: error,
      })
    }
  }

  function saveVoter() {
    if (voterState.state === VoterApiState.ERROR) {
      return;
    }
    const voter = (voterState as VoterStateLoaded).voter;
    makeApiRequest(`/voters/${voter.id}/update`, {
      method: "POST",
      jsonBody: voter
    }).catch((err) => setErrorState(err, voter));
  }

  function deleteVoter() {
    const voter = (voterState as VoterStateLoaded).voter;
    makeApiRequest(`/voters/${voter.id}`, { method: "DELETE" })
      .then(() => navigate('/'))
      .catch((err) => setErrorState(err, voter));
  }

  useEffect(() => {
    makeApiRequest<VoterResponse>(`/voters/${params.voterId}`)
      .then((response) => {
        setVoterState({
          state: VoterApiState.LOADED,
          voter: response.voter
        })
      }).catch(setErrorState);
  }, [params.voterId]);


  return (
    <Container maxWidth="md">
      <Typography sx={{ margin: "24px 0" }}>
        <a href="#" onClick={goBack}>
          &laquo; Back to Tags
        </a>
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h5">Edit</Typography>
          {voterState.state === VoterApiState.LOADING && <CircularProgress/>}
          {voterState.state === VoterApiState.ERROR &&
              <DisplayErrorHelper error={voterState.error}/>
          }
          {voterState.state === VoterApiState.LOADED && (
            <VoterForm
              voter={(voterState as VoterStateLoaded).voter}
              onChange={onVoterFieldChange}
            />
          )}
        </CardContent>
        <CardActions sx={{ margin: "0 16px 12px", justifyContent: "end" }}>
          <Button variant="outlined" onClick={saveVoter}>Save</Button>
          <Button variant="contained" color="error" onClick={deleteVoter}
          >Delete</Button>
        </CardActions>
      </Card>
    </Container>
  )
}