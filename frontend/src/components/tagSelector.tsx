import {
  Autocomplete,
  Chip,
  CircularProgress,
  createFilterOptions, FilterOptionsState,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import makeApiRequest from "../util/makeApiRequest";
import { AddTagResult, GetAllTagsResult, RemoveTagResult, VoterTag } from "../types";

interface Option {
  label: string;
  value: string;
}

const filter = createFilterOptions<Option>();

export function TagSelector({ voterId, voterTags }: { voterId: string; voterTags: VoterTag[] }) {
  const [initialLoading, setInitialLoading] = useState(true);
  const [tags, setTags] = useState(voterTags);
  const [tagSelectList, setTagSelectList] = useState<Option[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetError = () => setErrorMsg(null);

  const mapTagsToOptions = (tags: VoterTag[]): Option[] =>
    tags.map((t) => ({ label: t.name, value: t.name }));

  const removeTag = (name: string) => {
    const voterTagId = tags.find((t) => t.name === name)?.voterTagId;
    makeApiRequest<RemoveTagResult>(`/voters/${voterId}/removeTag`, {
      method: "POST",
      jsonBody: { voterTagId },
    }).then((response) => {
      setTags((prevTags) => prevTags.filter((t) => t.voterTagId !== response.voterTagId));
    });
  };

  const addTag = (name: string) => {
    makeApiRequest<AddTagResult>(`/voters/${voterId}/addTag`, {
      method: "POST",
      jsonBody: { name },
    }).then(
      (response) => {
        setTags((prevTags) => [...prevTags, response]);
        resetError();
      },
      (error: string) => setErrorMsg(error)
    );
  };

  // Load available tags on mount
  useEffect(() => {
    makeApiRequest<GetAllTagsResult>(`/voters/tags`).then((response) => {
      const tagOptions = response.tags.map((t) => ({ label: t.name, value: t.name }));
      setTagSelectList(tagOptions);
      setInitialLoading(false);
    });
  }, []);

  // Handlers for Autocomplete changes
  const handleAutocompleteChange = (
    _: unknown,
    _value: (string | Option)[],
    reason: string,
    details?: { option: Option }
  ) => {
    if ((reason === "selectOption" || reason === "createOption") && details?.option) {
      addTag(details.option.value);
    }
    if (reason === "removeOption" && details?.option) {
      removeTag(details.option.value);
    }
  };

  const renderTags = (value: readonly Option[], getTagProps: any) =>
    mapTagsToOptions(tags).map((option, index) => {
      const { key, ...tagProps } = getTagProps({ index });
      return <Chip variant="outlined" label={option.value} key={key} {...tagProps} />;
    });

  const filterTagOptions = (options: Option[], params: FilterOptionsState<Option>) => {
    const filtered = filter(options, params);
    const { inputValue } = params;
    const isExisting = options.some((option) => inputValue.toLowerCase() === option.value.toLowerCase());
    if (inputValue !== "" && !isExisting) {
      filtered.push({ label: `Add "${inputValue}"`, value: inputValue });
    }
    return filtered;
  };

  if (initialLoading) {
    return <CircularProgress />;
  }

  return (
    <FormControl error={Boolean(errorMsg)} sx={{ width: "100%" }}>
      <Autocomplete
        id="tags-filled"
        multiple
        fullWidth
        clearOnBlur
        selectOnFocus
        handleHomeEndKeys
        freeSolo
        defaultValue={mapTagsToOptions(tags)}
        options={tagSelectList}
        onChange={handleAutocompleteChange}
        renderTags={renderTags}
        filterOptions={filterTagOptions}
        renderInput={(params) => (
          <TextField {...params} label="Add tag" error={Boolean(errorMsg)} />
        )}
      />
      {errorMsg && <FormHelperText>{errorMsg}</FormHelperText>}
    </FormControl>
  );
}
