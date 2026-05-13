export default function Logo(props: {
  color?: "black" | "white";
  alignment?: "middle" | "bottom";
}): JSX.Element {
  const color = props.color ?? "black";
  const baseUrl = import.meta.env.BASE_URL;

  return (
    <span>
      <img
        src={`${baseUrl}logo/motor.svg`}
        className={["svg", `svg-${color}`, "logo-img"].join(" ")}
      />
      <b className="logo-text">Mechanisim Calculator</b>
      <div className="logo-subtitle has-text-centered">
        A robotics mechanism calculator.
      </div>
    </span>
  );
}
