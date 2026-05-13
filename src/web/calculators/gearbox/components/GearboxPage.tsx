import Metadata from "common/components/Metadata";
import gearboxConfig from "web/calculators/gearbox";
import GearboxCalculator from "web/calculators/gearbox/components/GearboxCalculator";

export default function GearboxPage(): JSX.Element {
  return (
    <>
      <Metadata pageConfig={gearboxConfig} />
      <GearboxCalculator />
    </>
  );
}
