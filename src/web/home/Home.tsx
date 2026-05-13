import Metadata from "common/components/Metadata";
import { Icon } from "common/components/styling/Building";
import PageConfig from "common/models/PageConfig";
import { Link } from "react-router-dom";
import armConfig from "web/calculators/arm";
import beltsConfig from "web/calculators/belts";
import chainConfig from "web/calculators/chain";
import driveConfig from "web/calculators/drive";
import elevatorConfig from "web/calculators/elevator";
import flywheelConfig from "web/calculators/flywheel";
import gearLoadConfig from "web/calculators/gearLoad";
import gearConfig from "web/calculators/gears";
import intakeConfig from "web/calculators/intake";
import linearConfig from "web/calculators/linear";
import ratioConfig from "web/calculators/ratio";
import ratioFinderConfig from "web/calculators/ratioFinder";
import RecalcIcon, { RecalcIconName } from "web/home/recalcIcons";
import compressorsConfig from "web/info/compressors";
import motorsConfig from "web/info/motors";
import utilConfig from "web/info/util";

type Tool = {
  config: PageConfig;
  icon: RecalcIconName;
  title?: string;
};

const powerTransmissionTools: Tool[] = [
  { config: beltsConfig, icon: "belt" },
  { config: chainConfig, icon: "chain" },
  { config: gearConfig, icon: "gears", title: "Gears Calculator" },
  { config: gearLoadConfig, icon: "gears" },
  {
    config: ratioFinderConfig,
    icon: "ratioFinder",
    title: "Ratio Finder",
  },
  { config: ratioConfig, icon: "ratio" },
];

const mechanismTools: Tool[] = [
  { config: elevatorConfig, icon: "linear", title: "Elevator Calculator" },
  { config: linearConfig, icon: "linear", title: "Linear Mechanism" },
  { config: armConfig, icon: "arm" },
  { config: flywheelConfig, icon: "flywheel" },
  { config: intakeConfig, icon: "intake" },
];

const drivetrainTools: Tool[] = [
  { config: driveConfig, icon: "gears", title: "Drivetrain Calculator" },
];

const referenceTools: Tool[] = [
  { config: motorsConfig, icon: "motor", title: "Motors" },
  { config: compressorsConfig, icon: "motor", title: "Compressors" },
  { config: utilConfig, icon: "utilities", title: "Utilities" },
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
        <RecalcIcon name={tool.icon} />
      </span>
      <span className="tool-row__title">{tool.title ?? tool.config.title}</span>
      <span className="tool-row__action" aria-hidden="true">
        <Icon name="arrow-right" />
      </span>
    </Link>
  );
}

export default function Home(): JSX.Element {
  return (
    <>
      <Metadata title="Fast local-first robotics mechanism calculators." />

      <main className="dashboard-home">
        <section className="dashboard-hero">
          <img
            alt="Momentum 4999"
            className="dashboard-logo"
            src={`${import.meta.env.BASE_URL}logo/momentum-logo.png`}
          />
          <h1 className="dashboard-wordmark">MoCalc</h1>
        </section>

        <section
          className="tool-section"
          aria-labelledby="power-transmission-heading"
        >
          <SectionDivider title="Power Transmission" />
          <h2 id="power-transmission-heading" className="is-sr-only">
            Power Transmission
          </h2>
          <div className="tool-list">
            {powerTransmissionTools.map((tool) => (
              <ToolCard key={tool.config.url} tool={tool} />
            ))}
          </div>
        </section>

        <section className="tool-section" aria-labelledby="mechanism-heading">
          <SectionDivider title="Mechanisms" />
          <h2 id="mechanism-heading" className="is-sr-only">
            Mechanisms
          </h2>
          <div className="tool-list">
            {mechanismTools.map((tool) => (
              <ToolCard key={tool.config.url} tool={tool} />
            ))}
          </div>
        </section>

        <section className="tool-section" aria-labelledby="drivetrain-heading">
          <SectionDivider title="Drivetrain" />
          <h2 id="drivetrain-heading" className="is-sr-only">
            Drivetrain
          </h2>
          <div className="tool-list tool-list--single">
            {drivetrainTools.map((tool) => (
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
      </main>
    </>
  );
}
