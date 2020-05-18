import React, { useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import queryString from "query-string";
import FormGroup from "react-bootstrap/FormGroup";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

import useQueryParams from "../../useQueryParams";
import useSyncValue from "../../useSyncValue";
import Button from "../../ui/components/Button";

export default function SearchForm() {
  const history = useHistory();
  const testRunId = useRouteMatch().params.testRunId;
  const queryParams = useQueryParams();

  const [search, setSearch] = useState("");

  useSyncValue(queryParams.search, (value) => setSearch(value));

  const handleSearchChange = (event) => setSearch(event.target.value);

  const handleSubmit = (event) => {
    event.preventDefault();

    history.push({
      pathname: `/test-runs/${testRunId}/search`,
      search: queryString.stringify({
        search
      })
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormGroup controlId="search">
        <InputGroup size="lg">
          <FormControl type="text" value={search} onChange={handleSearchChange} placeholder="Rechercher..." />
          <InputGroup.Append>
            <Button icon={faSearch} type="submit">
              Rechercher
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </FormGroup>
    </form>
  );
}