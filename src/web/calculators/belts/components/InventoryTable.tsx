import Belt from "common/models/Belt";
import { FRCVendor } from "common/models/ExtraTypes";
import Measurement from "common/models/Measurement";
import React from "react";

const cotsBelts: Belt[] = Belt.getAllBelts(true);

function vendorClass(vendor: FRCVendor): string {
  return vendor.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function makeSku(belt: Belt): string {
  return (
    belt.sku ??
    `${belt.teeth}T-${belt.pitch.format().replace(/\s+/g, "")}-${
      belt.width?.format().replace(/\s+/g, "") ?? "unknown"
    }`
  );
}

export default function InventoryTable(props: {
  smallerTeeth: number;
  largerTeeth?: number;
  pitch: Measurement;
}): JSX.Element {
  const beltTeeth = Array.from(
    new Set(
      [props.smallerTeeth, props.largerTeeth].filter(
        (teeth): teeth is number => teeth !== undefined && teeth !== 0,
      ),
    ),
  );
  const data = cotsBelts
    .filter(
      (belt) => belt.pitch.eq(props.pitch) && beltTeeth.includes(belt.teeth),
    )
    .sort(
      (a, b) =>
        a.teeth - b.teeth ||
        (a.vendor ?? "").localeCompare(b.vendor ?? "") ||
        (a.width?.to("mm").scalar ?? 0) - (b.width?.to("mm").scalar ?? 0) ||
        makeSku(a).localeCompare(makeSku(b)),
    );

  const tHead = (
    <thead>
      <tr>
        <th colSpan={4}>
          Matching COTS Belts{" "}
          <span className="cots-part-count">{data.length}</span>
        </th>
      </tr>
      <tr>
        <th>SKU</th>
        <th>Teeth</th>
        <th>Width</th>
        <th>Type</th>
      </tr>
    </thead>
  );

  const id = "inventory-table";
  return (
    <div id={id} data-testid={id} style={{ paddingBottom: "8px" }}>
      <div className="table-container">
        <div className="table-container2">
          <table className="table is-fullwidth is-narrow is-hoverable">
            {tHead}
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td className="cots-part-empty" colSpan={4}>
                    No matching COTS belts
                  </td>
                </tr>
              ) : (
                data.map((belt, index) => {
                  const previous = index > 0 ? data[index - 1] : null;
                  const sku = makeSku(belt);
                  const isVbeltGuys = belt.vendor === "VBeltGuys";
                  const linkLabel = isVbeltGuys ? "Vbeltguys" : sku;

                  return (
                    <React.Fragment
                      key={`${belt.vendor}-${sku}-${belt.teeth}-${belt.width?.format()}`}
                    >
                      {previous !== null && previous.teeth !== belt.teeth ? (
                        <tr className="cots-part-divider">
                          <td colSpan={4} />
                        </tr>
                      ) : null}
                      <tr>
                        <td>
                          <div className="cots-sprocket-sku">
                            {belt.vendor !== undefined && !isVbeltGuys ? (
                              <span
                                className={[
                                  "cots-sprocket-vendor",
                                  `cots-sprocket-vendor--${vendorClass(
                                    belt.vendor,
                                  )}`,
                                ].join(" ")}
                              >
                                {belt.vendor}
                              </span>
                            ) : null}
                            {belt.url !== undefined ? (
                              <a
                                href={belt.url}
                                rel="noreferrer"
                                title={isVbeltGuys ? sku : undefined}
                                target="_blank"
                              >
                                {linkLabel}
                              </a>
                            ) : (
                              <span>{linkLabel}</span>
                            )}
                          </div>
                        </td>
                        <td>{belt.teeth}</td>
                        <td>{belt.width?.format()}</td>
                        <td>{belt.type}</td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
