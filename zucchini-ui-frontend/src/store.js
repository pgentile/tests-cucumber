import { createStore, applyMiddleware, compose } from "redux";
import promise from "redux-promise-middleware";
import thunkMiddleware from "redux-thunk";
import freezeMiddleware from "redux-freeze";

import reducer from "./reducer";
import featureFiltersStorage from "./filters/featureFiltersStorage";
import statsDashboardFiltersStorage from "./filters/statsDashboardFiltersStorage";
import historyFiltersStorage from "./filters/historyFiltersStorage";
import scenarioFiltersStorage from "./filters/scenarioFiltersStorage";
import stepFiltersStorage from "./filters/stepFiltersStorage";
import { default as createStorageMiddleware } from "./browserStorage/createMiddleware";
import { default as createWebSocketMiddleware } from "./websocket/createMiddleware";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const middlewares = [
  createWebSocketMiddleware("PRESENCE"),
  createStorageMiddleware(featureFiltersStorage, (state) => state.featureFilters),
  createStorageMiddleware(statsDashboardFiltersStorage, (state) => state.statsDashboardFilters),
  createStorageMiddleware(historyFiltersStorage, (state) => state.historyFilters),
  createStorageMiddleware(scenarioFiltersStorage, (state) => state.scenarioFilters),
  createStorageMiddleware(stepFiltersStorage, (state) => state.stepFilters),
  thunkMiddleware,
  promise
];

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV !== "production") {
  console.info("%c ❄️ Using the freeze middleware. Bad mutable store updates will be detected!", "font-weight: bold");
  middlewares.push(freezeMiddleware);
}

const initialState = {};

export default createStore(reducer, initialState, composeEnhancers(applyMiddleware(...middlewares)));
