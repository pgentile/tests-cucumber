import PropTypes from "prop-types";
import React from "react";
import Table from "react-bootstrap/Table";
import Badge from "react-bootstrap/Badge";
import { Link } from "react-router-dom";

import Status from "../../ui/components/Status";
import toNiceDate from "../../ui/toNiceDate";

export default class FeatureHistoryTable extends React.PureComponent {
  static propTypes = {
    featureId: PropTypes.string.isRequired,
    history: PropTypes.arrayOf(PropTypes.object)
  };

  render() {
    const { history, featureId } = this.props;

    const rows = history.map((feature) => {
      const isActive = feature.id === featureId;
      return <FeatureHistoryTableRow key={feature.id} feature={feature} isActive={isActive} />;
    });

    return (
      <Table bordered striped hover>
        <thead>
          <tr>
            <th className="col-md-1">Type</th>
            <th className="col-md-1">Environnement</th>
            <th className="col-md-1">Nom</th>
            <th className="col-md-2">Tir de test</th>
            <th className="col-md-1">Statut</th>
            <th className="col-md-1">Total</th>
            <th className="col-md-1">Succès</th>
            <th className="col-md-1">Échecs</th>
            <th className="col-md-1">En attente</th>
            <th className="col-md-1">Non joués</th>
            <th className="col-md-1">Analysés</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    );
  }
}

class FeatureHistoryTableRow extends React.PureComponent {
  static propTypes = {
    feature: PropTypes.object.isRequired,
    isActive: PropTypes.bool.isRequired
  };

  render() {
    const { feature, isActive } = this.props;
    const className = isActive ? "info" : null;

    return (
      <tr className={className}>
        <td>
          <Badge>{feature.testRun.type}</Badge>
        </td>
        <td>
          <Badge>{feature.testRun.environment}</Badge>
        </td>
        <td>
          <Badge>{feature.testRun.name}</Badge>
        </td>
        <td>
          <Link to={`/features/${feature.id}`}>Tir du {toNiceDate(feature.testRun.date)}</Link>
        </td>
        <td>
          <Status status={feature.status} />
        </td>
        <td>
          <Badge pill>{feature.stats.all.count}</Badge>
        </td>
        <td>
          <Badge pill>{feature.stats.all.passed}</Badge>
        </td>
        <td>
          <Badge pill>{feature.stats.all.failed}</Badge>
        </td>
        <td>
          <Badge pill>{feature.stats.all.pending}</Badge>
        </td>
        <td>
          <Badge pill>{feature.stats.all.notRun}</Badge>
        </td>
        <td>
          <Badge pill>{feature.stats.reviewed.count}</Badge>
        </td>
      </tr>
    );
  }
}
