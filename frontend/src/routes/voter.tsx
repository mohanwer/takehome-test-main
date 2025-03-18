import {
  Button,
  Card, CardActions,
  CardContent,
  CircularProgress,
  Container, Divider,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Voter, VoterResponse, VoterTag } from "../types";
import makeApiRequest from "../util/makeApiRequest";
import { TagSelector } from "../components/tagSelector";

type VoterStateLoading = {
  state: "LOADING";
};

type VoterStateLoaded = {
  state: "LOADED";
  voter: Voter;
  tags: VoterTag[];
};

type VoterStateError = {
  state: "ERROR";
  error: Error;
};

type VoterState = VoterStateLoading | VoterStateLoaded | VoterStateError;

function VoterCardContent({ voter, tags }: { voter: Voter, tags: VoterTag[] }) {
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
      <Divider sx={{ marginTop: 2, marginBottom: 2 }}/>
      <TagSelector voterId={voter.id} voterTags={tags}/>
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
    makeApiRequest<VoterResponse>(`/voters/${params.voterId}`)
      .then((response) => {
        setVoterState({
          state: "LOADED",
          voter: response.voter,
          tags: response.tags,
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
          {voterState.state === "LOADING" && <CircularProgress/>}
          {voterState.state === "ERROR" && (
            <Typography variant="h5" component="h2">
              Error: {voterState.error.message}
            </Typography>
          )}
          {voterState.state === "LOADED" && (
            <>
              <VoterCardContent voter={voterState.voter} tags={voterState.tags}/>

            </>
          )}
        </CardContent>
        <CardActions sx={{ margin: "0 16px 12px", justifyContent: "end" }}>
          <Button
            onClick={() => navigate(`/voters/${voterState.voter.id}/edit`)}
            variant="contained"
          >
            Edit
          </Button>
        </CardActions>
      </Card>
    </Container>
  );
}
