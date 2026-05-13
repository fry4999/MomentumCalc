import amPulleys from "common/models/data/cots/andymark/pulleys.json";
import revPulleys from "common/models/data/cots/rev/pulleys.json";
import ttbPulleys from "common/models/data/cots/ttb/pulleys.json";
import vexPulleys from "common/models/data/cots/vex/pulleys.json";
import wcpPulleys from "common/models/data/cots/wcp/pulleys.json";
import { FRCVendor, PulleyBeltType } from "common/models/ExtraTypes";
import Measurement from "common/models/Measurement";
import Pulley from "common/models/Pulley";
import React from "react";

type RawCotsPulley = {
  bore: string;
  partNumber: string;
  pitch: { s: number; u: string };
  teeth: number;
  type: PulleyBeltType;
  url: string;
  vendor: FRCVendor;
  width: { s: number; u: string };
};

const cotsPulleys = [
  ...revPulleys,
  ...vexPulleys,
  ...wcpPulleys,
  ...amPulleys,
  ...ttbPulleys,
] as RawCotsPulley[];

function vendorClass(vendor: FRCVendor): string {
  return vendor.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function PulleyCheatSheet(props: {
  pitch: Measurement;
  currentPulleys: Pulley[];
}): JSX.Element {
  const pulleyTeeth = Array.from(
    new Set(props.currentPulleys.map((pulley) => pulley.teeth)),
  );
  const data = cotsPulleys
    .map((p) => ({
      ...p,
      pulley: Pulley.fromTeeth(p.teeth, Measurement.fromDict(p.pitch), {
        vendors: [p.vendor as FRCVendor],
        type: p.type as PulleyBeltType,
        urls: [p.url],
        bore: p.bore,
        widths: [Measurement.fromDict(p.width)],
      }),
      width: Measurement.fromDict(p.width),
    }))
    .filter(
      (p) =>
        p.pulley.pitch.eq(props.pitch) && pulleyTeeth.includes(p.pulley.teeth),
    )
    .sort(
      (a, b) =>
        a.teeth - b.teeth ||
        a.vendor.localeCompare(b.vendor) ||
        a.bore.localeCompare(b.bore) ||
        a.width.to("mm").scalar - b.width.to("mm").scalar ||
        a.partNumber.localeCompare(b.partNumber),
    );

  return (
    <>
      <div className="table-container">
        <table className="table is-hoverable is-narrow is-fullwidth">
          <thead>
            <tr>
              <th colSpan={4}>
                Matching COTS Pulleys{" "}
                <span className="cots-part-count">{data.length}</span>
              </th>
            </tr>
            <tr>
              <th>SKU</th>
              <th>Teeth</th>
              <th>Width</th>
              <th>Bore</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td className="cots-part-empty" colSpan={4}>
                  No matching COTS pulleys
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const previous = index > 0 ? data[index - 1] : null;

                return (
                  <React.Fragment
                    key={`${item.vendor}-${item.partNumber}-${item.bore}-${item.width.format()}`}
                  >
                    {previous !== null && previous.teeth !== item.teeth ? (
                      <tr className="cots-part-divider">
                        <td colSpan={4} />
                      </tr>
                    ) : null}
                    <tr>
                      <td>
                        <div className="cots-sprocket-sku">
                          <span
                            className={[
                              "cots-sprocket-vendor",
                              `cots-sprocket-vendor--${vendorClass(
                                item.vendor,
                              )}`,
                            ].join(" ")}
                          >
                            {item.vendor}
                          </span>
                          <a href={item.url} rel="noreferrer" target="_blank">
                            {item.partNumber}
                          </a>
                        </div>
                      </td>
                      <td>{item.teeth}</td>
                      <td>{item.width.format()}</td>
                      <td className="is-size-7">{item.bore}</td>
                    </tr>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
