(function (window) {
  window["env"] = window["env"] || {};

  // Environment variables
  window["env"]["portalUrl"] = "${PORTAL_URL}";
  window["env"]["apiUrl"] = "${API_URL}";
  window["env"]["terminologyServiceUrl"] = "${TERMINOLOGY_SERVICE_URL}";
  window["env"]["authBaseUrl"] = "${AUTH_BASE_URL}";
  window["env"]["realm"] = "${REALM}";
  window["env"]["queryServiceUrl"] = "${QUERY_SERVICE_URL}";
  window["env"]["webSocketUrl"] = "${WEB_SOCKET_URL}";
  window["env"]["xcdsServiceEnabled"] = "${XCDS_SERVICE_ENABLED}";
  window["env"]["xcdsServiceUrl"] = "${XCDS_SERVICE_URL}";
  window["env"]["pilotCountry"] = "${PILOT_COUNTRY}";
  window["env"]["defaultLanguage"] = "${DEFAULT_LANGUAGE}";
  window["env"]["labDefaultUnit"] = "${DEFAULT_UOM}";
  window["env"]["bugReportUrl"] = "${BUG_REPORT_URL}";
  window["env"]["visualExplainer"] = "${VISUAL_EXPLAINER_ENABLED}";
  window["env"]["visualExplainerUrl"] = "${VISUAL_EXPLAINER_URL}";
  window["env"]["slofitPidSystem"] = "${SLOFIT_SYSTEM}";
  window["env"]["testEnv"] = "${TEST_ENV}";
})(this);
