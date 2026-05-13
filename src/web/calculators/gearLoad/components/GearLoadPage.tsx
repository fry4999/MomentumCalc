import Metadata from "common/components/Metadata";
import gearLoadConfig from "web/calculators/gearLoad";
import GearLoadCalculator from "web/calculators/gearLoad/components/GearLoadCalculator";

export default function GearLoadPage(): JSX.Element {
  return (
    <>
      <Metadata pageConfig={gearLoadConfig} />
      <GearLoadCalculator />
    </>
  );
}
