import {
  Autocomplete,
  Chip, debounce,
  FilterOptionsState,
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

export function TagSelector({ voterId, voterTags }: { voterId: string; voterTags: VoterTag[] }) {
  const initialTags = [...voterTags]
  const [tags, setTags] = useState(voterTags);
  const [tagSelectList, setTagSelectList] = useState<Option[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [textBox, setTextBox] = useState("");

  const resetError = () => setErrorMsg(null);

  const mapTagsToOptions = (tags: (VoterTag|{name: string})[]): Option[] =>
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

  useEffect(() => {
    const timeout = setTimeout(() =>
    {
      makeApiRequest<GetAllTagsResult>(`/voters/tags/search?text=${textBox}`)
        .then((response) => {
          const tagOptions = response.tags.map(t => ({ label: t.name, value: t.name }));
          setTagSelectList(tagOptions);
        })
        .catch((error: any) => {
          setErrorMsg(error.message);
        })
    }, 500);
    return () => clearTimeout(timeout);
  }, [textBox])

  const handleAutocompleteChange = (
    _: unknown,
    value: (string | Option)[],
    reason: string,
    details?: { option: Option }
  ) => {
    console.log(reason, details);
    if (!details?.option) {
      return;
    }
    if (reason === "createOption") {
      addTag((details.option as unknown) as string);
    } else if (reason === "selectOption") {
      addTag(details.option.value);
    }
    else if (reason === "removeOption") {
      removeTag(details.option.value);
    }
  };

  const renderTags = (value: readonly Option[], getTagProps: any) =>
    mapTagsToOptions(tags).map((option, index) => {
      const { key, ...tagProps } = getTagProps({ index });
      return <Chip variant="outlined" label={option.value} key={key} {...tagProps} />;
    });

  const filterTagOptions = (options: Option[], params: FilterOptionsState<Option>) => {
    const filtered = [...options];
    const { inputValue } = params;
    const isExisting = options.some((option) => inputValue.toLowerCase() === option.value.toLowerCase());
    if (inputValue !== "" && !isExisting) {
      filtered.push({ label: `Add "${inputValue}"`, value: inputValue });
    }
    return filtered;
  };


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
        defaultValue={mapTagsToOptions(initialTags)}
        options={tagSelectList}
        onChange={handleAutocompleteChange}
        renderTags={renderTags}
        filterOptions={filterTagOptions}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Add tag"
            error={Boolean(errorMsg)}
            value={textBox}
            onChange={(e) => {
              setTextBox(e.target.value);
            }}
          />
        )}
      />
      {errorMsg && <FormHelperText>{errorMsg}</FormHelperText>}
    </FormControl>
  );
}
