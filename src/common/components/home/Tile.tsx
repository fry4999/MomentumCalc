import { Link } from "react-router-dom";

export type ImageSize = "4by3" | "square";
export default function Tile(props: {
  to: string;
  image?: string;
  title: string;
  imageSize?: ImageSize | string;
}): JSX.Element {
  const imagePath =
    props.image && props.image.startsWith("/")
      ? import.meta.env.BASE_URL + props.image.slice(1)
      : props.image;

  return (
    <Link to={props.to}>
      <div className={"recalc-box"}>
        <div className="columns">
          <div className="column is-one-quarter">
            <figure
              className={[
                "image",
                props.imageSize === undefined
                  ? "is-4by3"
                  : `is-${props.imageSize}`,
              ].join(" ")}
            >
              <picture>
                {imagePath && (
                  <>
                    <source type="image/webp" srcSet={imagePath + ".webp"} />
                    <source type="image/png" srcSet={imagePath + ".png"} />
                    <img
                      src={
                        (imagePath ||
                          "https://bulma.io/images/placeholders/1280x960") +
                        ".png"
                      }
                      alt={props.title}
                    />
                  </>
                )}
              </picture>
            </figure>
          </div>
          <div
            className="column subtitle is-size-4"
            style={{ display: "flex", alignItems: "center" }}
          >
            {props.title}
          </div>
        </div>
      </div>
    </Link>
  );
}
