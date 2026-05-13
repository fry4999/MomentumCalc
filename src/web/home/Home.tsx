import Metadata from "common/components/Metadata";
import { Icon } from "common/components/styling/Building";
import PageConfig from "common/models/PageConfig";
import { Link } from "react-router-dom";
import aboutConfig from "web/about";
import armConfig from "web/calculators/arm";
import beltsConfig from "web/calculators/belts";
import chainConfig from "web/calculators/chain";
import driveConfig from "web/calculators/drive";
import flywheelConfig from "web/calculators/flywheel";
import gearConfig from "web/calculators/gears";
import intakeConfig from "web/calculators/intake";
import linearConfig from "web/calculators/linear";
import pneumaticsConfig from "web/calculators/pneumatics";
import ratioConfig from "web/calculators/ratio";
import ratioFinderConfig from "web/calculators/ratioFinder";
import compressorsConfig from "web/info/compressors";
import motorsConfig from "web/info/motors";
import utilConfig from "web/info/util";

type Tool = {
  config: PageConfig;
  label: string;
  icon: string;
};

type Resource = {
  name: string;
  url: string;
  note: string;
};

const calculatorTools: Tool[] = [
  {
    config: armConfig,
    label: "Motion",
    icon: "ruler-combined",
  },
  {
    config: driveConfig,
    label: "Motion",
    icon: "gauge-high",
  },
  {
    config: flywheelConfig,
    label: "Motion",
    icon: "bolt",
  },
  {
    config: linearConfig,
    label: "Motion",
    icon: "ruler",
  },
  {
    config: beltsConfig,
    label: "Transmission",
    icon: "code-branch",
  },
  {
    config: chainConfig,
    label: "Transmission",
    icon: "link",
  },
  {
    config: gearConfig,
    label: "Transmission",
    icon: "gears",
  },
  {
    config: ratioConfig,
    label: "Transmission",
    icon: "calculator",
  },
  {
    config: ratioFinderConfig,
    label: "Transmission",
    icon: "screwdriver-wrench",
  },
  {
    config: intakeConfig,
    label: "Mechanism",
    icon: "arrow-right",
  },
  {
    config: pneumaticsConfig,
    label: "Mechanism",
    icon: "compress-arrows-alt",
  },
];

const referenceTools: Tool[] = [
  {
    config: motorsConfig,
    label: "Reference",
    icon: "bolt",
  },
  {
    config: compressorsConfig,
    label: "Reference",
    icon: "gauge-high",
  },
  {
    config: utilConfig,
    label: "Utilities",
    icon: "gear",
  },
  {
    config: aboutConfig,
    label: "Project",
    icon: "circle-info",
  },
];

const resources: Resource[] = [
  {
    name: "2026 Official PDF Manual",
    url: "https://firstfrc.blob.core.windows.net/frc2026/Manual/2026GameManual.pdf",
    note: "Game rules and season reference",
  },
  {
    name: "2026 Web Manual",
    url: "https://www.frcmanual.com/2026",
    note: "Fast searchable manual mirror",
  },
  {
    name: "FRC Q&A",
    url: "https://frc-qa.firstinspires.org/",
    note: "Official clarifications",
  },
  {
    name: "FRC Technical Resources",
    url: "https://www.firstinspires.org/resource-library/frc/technical-resources",
    note: "Control system and inspection links",
  },
  {
    name: "Open Alliance",
    url: "https://www.chiefdelphi.com/c/first/open-alliance/89",
    note: "Build logs and public design notes",
  },
  {
    name: "FRC Events",
    url: "https://frc-events.firstinspires.org/2026/Events/EventList",
    note: "Events, schedules, and results",
  },
];

function ToolRow({ tool }: { tool: Tool }): JSX.Element {
  return (
    <Link className="tool-row" to={tool.config.url}>
      <span className="tool-row__icon" aria-hidden="true">
        <Icon name={tool.icon} />
      </span>
      <span className="tool-row__content">
        <span className="tool-row__meta">{tool.label}</span>
        <span className="tool-row__title">{tool.config.title}</span>
        <span className="tool-row__description">{tool.config.description}</span>
      </span>
      <span className="tool-row__action" aria-hidden="true">
        <Icon name="arrow-right" />
      </span>
    </Link>
  );
}

function ResourceLink({ resource }: { resource: Resource }): JSX.Element {
  return (
    <a
      className="resource-link"
      href={resource.url}
      rel="noreferrer"
      target="_blank"
    >
      <span>
        <span className="resource-link__title">{resource.name}</span>
        <span className="resource-link__note">{resource.note}</span>
      </span>
      <Icon name="external-link-alt" />
    </a>
  );
}

export default function Home(): JSX.Element {
  return (
    <>
      <Metadata title="Fast local-first robotics mechanism calculators." />

      <main className="dashboard-home">
        <section className="dashboard-hero">
          <div>
            <p className="home-eyebrow">4999-inspired robotics tools</p>
            <h1>Mechanisim Calculator</h1>
            <p className="dashboard-hero__copy">
              A simple, browser-only workspace for checking robot mechanisms
              quickly. No accounts, no saved team data, no backend.
            </p>
          </div>

          <div className="hero-status" aria-label="Project principles">
            <span>Static hosted</span>
            <span>No data storage</span>
            <span>Fast to operate</span>
          </div>
        </section>

        <section className="tool-section" aria-labelledby="calculator-heading">
          <div className="section-heading">
            <div>
              <p className="home-eyebrow">Launch</p>
              <h2 id="calculator-heading">Calculators</h2>
            </div>
            <p>
              Pick the mechanism area first, then tune the numbers inside the
              calculator.
            </p>
          </div>

          <div className="tool-list">
            {calculatorTools.map((tool) => (
              <ToolRow key={tool.config.url} tool={tool} />
            ))}
          </div>
        </section>

        <section className="home-grid" aria-label="References and resources">
          <div className="utility-panel">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="home-eyebrow">Lookup</p>
                <h2>Reference</h2>
              </div>
            </div>

            <div className="compact-tool-list">
              {referenceTools.map((tool) => (
                <ToolRow key={tool.config.url} tool={tool} />
              ))}
            </div>
          </div>

          <div className="utility-panel">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="home-eyebrow">External</p>
                <h2>Resources</h2>
              </div>
            </div>

            <div className="resource-list">
              {resources.map((resource) => (
                <ResourceLink key={resource.url} resource={resource} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
