import { AddTagResult, GetAllTagsResult, RemoveTagResult, Tag, VoterResponse, VoterTag } from '../types';
import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  Chip,
  createFilterOptions,
  FormControl, FormHelperText,
  TextField
} from "@mui/material";
import { useEffect, useState } from "react";
import makeApiRequest from "../util/makeApiRequest";

interface Option {
  label: string;
  value: string;
}

const filter = createFilterOptions<Option>();

export function TagSelector({voterId, voterTags}: {voterId: string, voterTags: VoterTag[]}) {
  const [tags, setTags] = useState(voterTags);
  const [tagSelectList, setTagSelectList] = useState<Option[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const removeTag = (name: string) => {
    const voterTagId = tags.find(t => t.name === name)?.voterTagId;
    makeApiRequest<RemoveTagResult>(`/voters/${voterId}/removeTag`, { method: 'POST', jsonBody: { voterTagId }})
      .then(response => {
        const updatedTags = [...tags.filter(t => t.voterTagId !== response.voterTagId)];
        setTags(updatedTags);
      });
  }

  const addTag = (name: string) => {
    makeApiRequest<AddTagResult>(`/voters/${voterId}/addTag`, {method: 'POST', jsonBody: {name}})
      .then(
        (response) => {
          const updatedTags = [...tags, {...response}];
          setTags(updatedTags);
          setErrorMsg(null);
        },
        (rejectedReason: string) => {
          setErrorMsg(rejectedReason);
        }
      );
  }

  useEffect(() => {
    makeApiRequest<GetAllTagsResult>(`/voters/tags`)
      .then(response => {
        const existingTagNames = response.tags.map(t => {
          return { label: t.name, value: t.name };
        });
        setTagSelectList(existingTagNames);
      });
  }, [])

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
        defaultValue={tags.map(t => ({label: t.name, value: t.name}))}
        options={tagSelectList}
        onChange={(_: any, value: (string | Option)[], reason: AutocompleteChangeReason, details?: AutocompleteChangeDetails<Option>) => {
          if ((reason === 'selectOption' || reason === 'createOption') && details?.option) {
            addTag(details.option.value);
          }
          if (reason === "removeOption" && details?.option) {
            removeTag(details.option.value);
          }
        }}
        renderTags={(value: readonly Option[], getTagProps) =>
          tags.map(t => ({label: t.name, value:t.name})).map((option: Option, index: number) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip variant="outlined" label={option.value} key={key} {...tagProps} />
            );
          })
        }
        filterOptions={(options, params) => {
          const filtered = filter(options, params);
          const { inputValue } = params;
          const isExisting = options.some((option) => inputValue.toLowerCase() === option.value.toLowerCase());
          if (inputValue !== '' && !isExisting) {
            filtered.push({label: `Add "${inputValue}"`, value: inputValue,});
          }
          return filtered;
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Add tag"
            error={Boolean(errorMsg)}
          />
        )}
      />
      {errorMsg && <FormHelperText>{errorMsg}</FormHelperText>}
    </FormControl>
  )
}