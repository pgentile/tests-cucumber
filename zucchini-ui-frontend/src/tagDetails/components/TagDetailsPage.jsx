import { Fragment, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import toNiceDate from "../../ui/toNiceDate";
import FeatureStateFilter from "../../filters/components/FeatureStateFilter";
import ScenarioStateFilter from "../../filters/components/ScenarioStateFilter";
import TagDetailsFeatureTableContainer from "./TagDetailsFeatureTableContainer";
import TagDetailsScenarioTableContainer from "./TagDetailsScenarioTableContainer";
import TagSelectionForm from "./TagSelectionForm";
import Page from "../../ui/components/Page";
import TagDetailsBreadcrumbContainer from "./TagDetailsBreadcrumbContainer";
import { useParsedTags } from "../url";
import { loadTagDetailsPage } from "../redux";
import ScenarioStats from "../../stats/components/ScenarioStats";

export default function TagDetailsPage() {
  const testRunId = useParams().testRunId;
  const { tags, excludedTags } = useParsedTags();

  const includedTagsStr = useMemo(() => tags.map((tag) => `@${tag}`).join(" "), [tags]);
  const excludedTagsStr = useMemo(() => excludedTags.map((tag) => `~@${tag}`).join(" "), [excludedTags]);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadTagDetailsPage({ testRunId, tags, excludedTags }));
  }, [dispatch, testRunId, tags, excludedTags]);

  const testRun = useSelector((state) => state.testRun.testRun);

  const stats = useSelector((state) => state.tagDetails.stats);

  return (
    <Page
      title={
        <Fragment>
          Tags {includedTagsStr} {excludedTagsStr}{" "}
          <small className="text-muted">{`Tir du ${toNiceDate(testRun.date)}`}</small>
        </Fragment>
      }
      breadcrumb={<TagDetailsBreadcrumbContainer />}
    >
      <TagSelectionForm />

      <hr className="mt-0" />

      <h2>Statistiques</h2>
      <ScenarioStats stats={stats} />

      <h2>Fonctionnalités</h2>
      <FeatureStateFilter />
      <TagDetailsFeatureTableContainer />

      <hr />

      <h2>Scénarios</h2>
      <ScenarioStateFilter />
      <TagDetailsScenarioTableContainer />
    </Page>
  );
}
