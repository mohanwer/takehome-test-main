import {
  Card,
  CardContent,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Voter } from "../types";
import makeApiRequest from "../util/makeApiRequest";

type VoterStateLoading = {
  state: "LOADING";
};

type VoterStateLoaded = {
  state: "LOADED";
  voter: Voter;
};

type VoterStateError = {
  state: "ERROR";
  error: Error;
};

type VoterState = VoterStateLoading | VoterStateLoaded | VoterStateError;

function VoterCardContent({ voter }: { voter: Voter }) {
  return (
    <>
      <Typography variant="h5" component="h2">
        {voter.firstName} {voter.lastName}
      </Typography>
      <Typography variant="body2" component="p">
        {voter.address1}
      </Typography>
      <Typography variant="body2" component="p">
        {voter.address2}
      </Typography>
      <Typography variant="body2" component="p">
        {voter.city}, {voter.state} {voter.zip}
      </Typography>
      {/* TODO [Part 2]: add controls for adding and removing tags */}
    </>
  );
}

export default function VoterPage() {
  const [voterState, setVoterState] = useState<VoterState>({
    state: "LOADING",
  });
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    makeApiRequest<Voter>(`/voters/${params.voterId}`)
      .then((voter) => {
        setVoterState({
          state: "LOADED",
          voter,
        });
      })
      .catch((error: any) => {
        setVoterState({
          state: "ERROR",
          error,
        });
      });
  }, [params.voterId]);

  function goBack(e: React.MouseEvent) {
    e.preventDefault();
    navigate(-1);
  }

  return (
    <Container maxWidth="md">
      <Typography sx={{ margin: "24px 0" }}>
        <a href="#" onClick={goBack}>
          &laquo; Back to search
        </a>
      </Typography>
      <Card>
        <CardContent>
          {voterState.state === "LOADING" && <CircularProgress />}
          {voterState.state === "ERROR" && (
            <Typography variant="h5" component="h2">
              Error: {voterState.error.message}
            </Typography>
          )}
          {voterState.state === "LOADED" && (
            <VoterCardContent voter={voterState.voter} />
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
