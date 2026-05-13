import {
  Column,
  Columns,
  Footer,
  Message,
} from "common/components/styling/Building";
import Nav from "common/components/styling/Nav";
import qs from "query-string";
import { Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import aboutConfig from "web/about";
import armConfig from "web/calculators/arm";
import beltsConfig from "web/calculators/belts";
import chainConfig from "web/calculators/chain";
import driveConfig from "web/calculators/drive";
import flywheelConfig from "web/calculators/flywheel";
import gearConfig from "web/calculators/gears";
import intakeConfig from "web/calculators/intake";
import linearConfig from "web/calculators/linear";
import ratioConfig from "web/calculators/ratio";
import ratioFinderConfig from "web/calculators/ratioFinder";
import Home from "web/home/Home";
import compressorsConfig from "web/info/compressors";
import motorsConfig from "web/info/motors";
import utilConfig from "web/info/util";

function App(): JSX.Element {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <HelmetProvider>
        <Nav />
        <section className="section app-body">
          <div className="container app-container">
            <Suspense
              fallback={
                <progress className="progress is-small is-primary" max="100" />
              }
            >
              <QueryParamProvider
                adapter={ReactRouter6Adapter}
                options={{
                  searchStringToObject: qs.parse,
                  objectToSearchString: qs.stringify,
                }}
              >
                <Routes>
                  <Route path="/" element={<Home />} />

                  <Route
                    path={beltsConfig.url}
                    element={<beltsConfig.component />}
                  />
                  <Route
                    path={chainConfig.url}
                    element={<chainConfig.component />}
                  />
                  <Route
                    path={flywheelConfig.url}
                    element={<flywheelConfig.component />}
                  />
                  <Route
                    path={armConfig.url}
                    element={<armConfig.component />}
                  />
                  <Route
                    path={linearConfig.url}
                    element={<linearConfig.component />}
                  />
                  <Route
                    path={intakeConfig.url}
                    element={<intakeConfig.component />}
                  />
                  <Route
                    path={ratioConfig.url}
                    element={<ratioConfig.component />}
                  />
                  <Route
                    path={ratioFinderConfig.url}
                    element={<ratioFinderConfig.component />}
                  />
                  <Route
                    path={driveConfig.url}
                    element={<driveConfig.component />}
                  />
                  <Route
                    path={motorsConfig.url}
                    element={<motorsConfig.component />}
                  />
                  <Route
                    path={compressorsConfig.url}
                    element={<compressorsConfig.component />}
                  />
                  <Route
                    path={aboutConfig.url}
                    element={<aboutConfig.component />}
                  />
                  <Route
                    path={utilConfig.url}
                    element={<utilConfig.component />}
                  />
                  <Route
                    path={gearConfig.url}
                    element={<gearConfig.component />}
                  />
                  <Route path="*" element={<Home />} />
                </Routes>
              </QueryParamProvider>
            </Suspense>

            <Footer extraClasses="app-footer">
              <Columns centered>
                <Column ofTwelve={8}>
                  <Message color="warning" extraClasses="app-disclaimer">
                    These calculators are provided as reference <b>only</b>.
                    They are estimates intended to guide design decisions, not a
                    replacement for testing the real mechanism.
                  </Message>
                </Column>
              </Columns>
            </Footer>
          </div>
        </section>
      </HelmetProvider>
    </BrowserRouter>
  );
}

export default App;
