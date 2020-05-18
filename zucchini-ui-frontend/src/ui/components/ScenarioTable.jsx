import PropTypes from "prop-types";
import React from "react";
import Table from "react-bootstrap/Table";
import { Link } from "react-router-dom";

import Status from "../../ui/components/Status";
import ReviewedStatus from "../../ui/components/ReviewedStatus";

export default class ScenarioTable extends React.PureComponent {
  static propTypes = {
    scenarios: PropTypes.arrayOf(PropTypes.object),
    selectedScenarioId: PropTypes.string
  };

  render() {
    const { scenarios, selectedScenarioId } = this.props;

    const rows = scenarios.map((scenario) => {
      const isActive = scenario.id === selectedScenarioId;
      return <ScenarioTableRow key={scenario.id} scenario={scenario} isActive={isActive} />;
    });

    return (
      <Table bordered striped hover>
        <thead>
          <tr>
            <th>Scénario</th>
            <th>Statut</th>
            <th>Analysé</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    );
  }
}

class ScenarioTableRow extends React.PureComponent {
  static propTypes = {
    scenario: PropTypes.object.isRequired,
    isActive: PropTypes.bool.isRequired
  };

  render() {
    const { scenario, isActive } = this.props;
    const className = isActive ? "table-primary" : null;

    return (
      <tr className={className}>
        <td>
          <Link to={`/scenarios/${scenario.id}`}>
            <b>{scenario.info.keyword}</b> {scenario.info.name}
          </Link>
        </td>
        <td>
          <Status status={scenario.status} />
        </td>
        <td>
          <ReviewedStatus reviewed={scenario.reviewed} />
        </td>
      </tr>
    );
  }
}
