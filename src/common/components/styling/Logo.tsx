export default function Logo(props: {
  color?: "black" | "white";
  alignment?: "middle" | "bottom";
}): JSX.Element {
  const color = props.color ?? "black";
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <span className={["logo-lockup", `logo-lockup--${color}`].join(" ")}>
      <img
        src={`${baseUrl}logo/motor.svg`}
        className={["svg", `svg-${color}`, "logo-img"].join(" ")}
        alt=""
      />
      <span className="logo-copy">
        <b className="logo-text">Mechanisim</b>
        <span className="logo-subtitle">Calculator</span>
      </span>
    </span>
  );
}
