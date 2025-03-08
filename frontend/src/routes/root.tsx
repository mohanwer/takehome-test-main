import { ChevronRight, Person } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { SearchParams, VoterSearchResult } from "../types";
import makeApiRequest from "../util/makeApiRequest";
import { STATE_ABBREVIATIONS } from "../util/state";

type SearchResultStateEmpty = {
  state: "EMPTY";
};

type SearchResultStateLoading = {
  state: "LOADING";
};

type SearchResultStateLoaded = {
  state: "LOADED";
  results: VoterSearchResult[];
};

type SearchResultStateError = {
  state: "ERROR";
  error: Error;
};

type SearchResultState =
  | SearchResultStateEmpty
  | SearchResultStateLoading
  | SearchResultStateLoaded
  | SearchResultStateError;

const FormRow = styled("div")`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;

  & > .MuiFormControl-root {
    margin: 0 8px;
  }
`;

// This is the card at the top of the page with the search form
function SearchCard({
  onSearch,
  params,
  setParams,
}: {
  onSearch: (params: SearchParams) => void;
  params: SearchParams;
  setParams: (params: SearchParams) => void;
}) {
  function makeOnChangeHandler(key: keyof SearchParams) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setParams({ ...params, [key]: event.target.value });
    };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(params);
  }

  return (
    <Card sx={{ marginTop: "24px" }}>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Typography variant="h5" sx={{ marginLeft: "8px" }}>
            Search
          </Typography>
          <FormRow>
            <TextField
              label="First Name"
              onChange={makeOnChangeHandler("firstName")}
              value={params.firstName}
              fullWidth
            />
            <TextField
              label="Last Name"
              onChange={makeOnChangeHandler("lastName")}
              value={params.lastName}
              fullWidth
            />
          </FormRow>
          <FormRow>
            <TextField
              label="Address Line 1"
              onChange={makeOnChangeHandler("address1")}
              value={params.address1}
              fullWidth
            />
            <TextField
              label="Address Line 2"
              onChange={makeOnChangeHandler("address2")}
              value={params.address2}
              fullWidth
            />
          </FormRow>
          <FormRow>
            <TextField
              label="City"
              onChange={makeOnChangeHandler("city")}
              value={params.city}
              fullWidth
            />
            <TextField
              label="State"
              onChange={makeOnChangeHandler("state")}
              value={params.state}
              select
              sx={{ width: "150px" }}
            >
              {STATE_ABBREVIATIONS.map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Zip"
              onChange={makeOnChangeHandler("zip")}
              value={params.zip}
              inputProps={{ maxLength: 5, pattern: "[0-9]{5}" }}
              sx={{ width: "200px" }}
            />
          </FormRow>
        </CardContent>
        <CardActions sx={{ margin: "0 16px 12px", justifyContent: "end" }}>
          <Button variant="contained" type="submit">
            Search
          </Button>
        </CardActions>
      </form>
    </Card>
  );
}

// This card displays a list of results
function Results({ results }: { results: VoterSearchResult[] }) {
  if (results.length === 0) {
    // Empty state
    return (
      <Card sx={{ marginTop: "24px" }}>
        <CardContent>
          <Typography variant="h5">Results</Typography>
          <Typography variant="body1" sx={{ textAlign: "center" }}>
            No results found.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const truncatedResults = results.slice(0, 25);

  return (
    <Card sx={{ marginTop: "24px" }}>
      <CardContent>
        <Typography variant="h5">Results</Typography>
        <List>
          {truncatedResults.map(({ voter, confidence: _confidence }) => (
            <ListItem
              component={Link}
              to={`/voters/${voter.id}`}
              key={voter.id}
            >
              <ListItemAvatar>
                <Person />
              </ListItemAvatar>
              <ListItemText
                sx={{ paddingLeft: 1 }}
                primary={`${voter.firstName} ${voter.lastName}`}
                secondary={`${voter.address1} ${voter.address2} ${voter.city}, ${voter.state} ${voter.zip}`}
              />
              <ListItemSecondaryAction>
                <ChevronRight />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        {truncatedResults.length < results.length && (
          <Typography
            variant="body1"
            fontStyle="italic"
            sx={{ textAlign: "center" }}
          >
            Showing first 25 of {results.length} results.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function Root() {
  // We load in the initial state of the search form from URL parameters. This
  // allows us to maintain the form state when navigating forward/back
  const [urlParams, setUrlParams] = useSearchParams();
  const hasPerformedInitialSearch = useRef(false);

  // This stores the current state of our search query and results from the
  // server.
  const [searchResultState, setSarchResultState] = useState<SearchResultState>({
    state: "EMPTY",
  });

  // This is the current state of the search form, which is initialized from
  // URL parameters.
  const [searchFormParams, setSearchFormParams] = useState<SearchParams>({
    firstName: urlParams.get("firstName") || "",
    lastName: urlParams.get("lastName") || "",
    address1: urlParams.get("address1") || "",
    address2: urlParams.get("address2") || "",
    city: urlParams.get("city") || "",
    state: urlParams.get("state") || "",
    zip: urlParams.get("zip") || "",
  });

  // Search submit handler
  const onSearch = useCallback(
    async (params: SearchParams) => {
      // Save the search parameters to the URL
      setUrlParams(params);

      // Perform the search, rendering a LOADING state while we're waiting for
      // the server and then ending up in a LOADED or ERROR state
      setSarchResultState({ state: "LOADING" });
      try {
        setSarchResultState({
          state: "LOADED",
          results: (
            await makeApiRequest<{ matches: VoterSearchResult[] }>("/search", {
              urlParams: params,
            })
          ).matches,
        });
      } catch (error: any) {
        setSarchResultState({ state: "ERROR", error });
      }
    },
    [setUrlParams]
  );

  useEffect(() => {
    // This performs an initial search if the URL has any search parameters

    if (hasPerformedInitialSearch.current) {
      // We've already checked the URL params, so we don't need to do it again
      return;
    }

    hasPerformedInitialSearch.current = true;

    if (Object.values(searchFormParams).some((val) => val !== "")) {
      // The URL had search params, so we should perform an initial search
      onSearch(searchFormParams).catch((e) => console.error(e));
    }
  }, [onSearch, searchFormParams]);

  return (
    <Container maxWidth="md">
      <SearchCard
        onSearch={onSearch}
        params={searchFormParams}
        setParams={setSearchFormParams}
      />
      {searchResultState.state === "LOADING" && (
        <Card sx={{ marginTop: "24px" }}>
          <CardContent
            sx={{ display: "flex", justifyContent: "center", margin: "20px" }}
          >
            <CircularProgress />
          </CardContent>
        </Card>
      )}
      {searchResultState.state === "ERROR" && (
        <Card sx={{ marginTop: "24px" }}>
          <CardContent
            sx={{ display: "flex", justifyContent: "center", margin: "20px" }}
          >
            Error: {searchResultState.error.message}
          </CardContent>
        </Card>
      )}
      {searchResultState.state === "LOADED" && (
        <Results results={searchResultState.results} />
      )}
    </Container>
  );
}
