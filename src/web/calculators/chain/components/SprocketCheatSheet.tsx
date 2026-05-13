import Chain, { chainPitchMap } from "common/models/Chain";
import _andymarkSprockets from "common/models/data/cots/andymark/sprockets.json";
import _revSprockets from "common/models/data/cots/rev/sprockets.json";
import _ttbSprockets from "common/models/data/cots/ttb/sprockets.json";
import _vexSprockets from "common/models/data/cots/vex/sprockets.json";
import _wcpSprockets from "common/models/data/cots/wcp/sprockets.json";
import { ChainType, FRCVendor } from "common/models/ExtraTypes";
import Sprocket from "common/models/Sprocket";
import React from "react";

type RawCotsSprocket = {
  bore: string;
  partNumber: string;
  teeth: number;
  type: ChainType;
  url: string;
  vendor: FRCVendor;
};

const cotsSprockets = [
  ..._andymarkSprockets,
  ..._revSprockets,
  ..._ttbSprockets,
  ..._vexSprockets,
  ..._wcpSprockets,
] as RawCotsSprocket[];

export default function SprocketCheatSheet(props: {
  chainType: Chain;
  currentSprockets: Sprocket[];
}): JSX.Element {
  const sprocketTeeth = Array.from(
    new Set(props.currentSprockets.map((s) => s.teeth)),
  );

  const data = cotsSprockets
    .map((s) => ({
      ...s,
      sprocket: new Sprocket(s.teeth, chainPitchMap[s.type], {
        bore: s.bore,
        vendors: [s.vendor],
        wrong: false,
      }),
    }))
    .filter(
      (s) =>
        s.sprocket.pitch.eq(props.chainType.pitch) &&
        sprocketTeeth.includes(s.teeth),
    )
    .sort(
      (a, b) =>
        a.teeth - b.teeth ||
        a.bore.localeCompare(b.bore) ||
        a.vendor.localeCompare(b.vendor) ||
        a.partNumber.localeCompare(b.partNumber),
    );

  const vendorClass = (vendor: FRCVendor) =>
    vendor.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <>
      <div className="table-container">
        <table className="table is-hoverable is-narrow is-fullwidth">
          <thead>
            <tr>
              <th colSpan={3}>Matching COTS Sprockets</th>
            </tr>
            <tr>
              <th>SKU</th>
              <th>Teeth</th>
              <th>Bore</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td className="has-text-centered has-text-grey" colSpan={3}>
                  No matching COTS sprockets
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const previous = index > 0 ? data[index - 1] : null;

                return (
                  <React.Fragment key={item.partNumber}>
                    {previous !== null && previous.teeth !== item.teeth ? (
                      <tr className="cots-sprocket-divider">
                        <td colSpan={3} />
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
