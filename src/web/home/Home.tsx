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
import ratioConfig from "web/calculators/ratio";
import ratioFinderConfig from "web/calculators/ratioFinder";
import compressorsConfig from "web/info/compressors";
import motorsConfig from "web/info/motors";
import utilConfig from "web/info/util";

type Tool = {
  config: PageConfig;
  icon: string;
  title?: string;
};

type Resource = {
  name: string;
  url: string;
  note: string;
};

const calculatorTools: Tool[] = [
  { config: beltsConfig, icon: "code-branch" },
  { config: chainConfig, icon: "link" },
  { config: linearConfig, icon: "ruler", title: "Linear Mechanism" },
  { config: armConfig, icon: "ruler-combined" },
  { config: flywheelConfig, icon: "bolt" },
  { config: intakeConfig, icon: "arrow-right" },
  {
    config: ratioFinderConfig,
    icon: "screwdriver-wrench",
    title: "Ratio Finder",
  },
  { config: ratioConfig, icon: "calculator" },
  { config: gearConfig, icon: "gears", title: "Gears Calculator" },
  { config: driveConfig, icon: "gauge-high", title: "Drivetrain Calculator" },
];

const referenceTools: Tool[] = [
  { config: motorsConfig, icon: "bolt", title: "Motors" },
  { config: compressorsConfig, icon: "gauge-high", title: "Compressors" },
  { config: utilConfig, icon: "gear", title: "Utilities" },
  { config: aboutConfig, icon: "circle-info", title: "About" },
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
    name: "2026 Q&A",
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

function SectionDivider({ title }: { title: string }): JSX.Element {
  return (
    <div className="section-divider">
      <span>{title}</span>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }): JSX.Element {
  return (
    <Link className="tool-row" to={tool.config.url}>
      <span className="tool-row__icon" aria-hidden="true">
        <Icon name={tool.icon} />
      </span>
      <span className="tool-row__title">{tool.title ?? tool.config.title}</span>
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
          <p className="home-eyebrow">4999-inspired mechanism tools</p>
          <h1>Mechanisim Calculator</h1>
          <p className="dashboard-hero__copy">
            A fast, browser-only mechanical design calculator for FIRST
            Robotics.
          </p>
        </section>

        <section className="tool-section" aria-labelledby="calculator-heading">
          <SectionDivider title="Calculators" />
          <h2 id="calculator-heading" className="is-sr-only">
            Calculators
          </h2>
          <div className="tool-list">
            {calculatorTools.map((tool) => (
              <ToolCard key={tool.config.url} tool={tool} />
            ))}
          </div>
        </section>

        <section className="tool-section" aria-labelledby="info-heading">
          <SectionDivider title="Information" />
          <h2 id="info-heading" className="is-sr-only">
            Information
          </h2>
          <div className="tool-list tool-list--reference">
            {referenceTools.map((tool) => (
              <ToolCard key={tool.config.url} tool={tool} />
            ))}
          </div>
        </section>

        <section className="tool-section" aria-labelledby="shortcut-heading">
          <SectionDivider title="Shortcuts" />
          <h2 id="shortcut-heading" className="is-sr-only">
            Shortcuts
          </h2>
          <div className="resource-list">
            {resources.map((resource) => (
              <ResourceLink key={resource.url} resource={resource} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
