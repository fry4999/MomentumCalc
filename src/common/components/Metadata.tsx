import PageConfig from "common/models/PageConfig";
import { Helmet } from "react-helmet-async";

export default function Metadata(props: {
  pageConfig?: PageConfig;
  title?: string;
}): JSX.Element {
  const withBasePath = (path: string) =>
    path.startsWith("/") ? import.meta.env.BASE_URL + path.slice(1) : path;

  if (props.pageConfig != undefined) {
    return (
      <Helmet>
        <title>Mechanisim Calculator - {props.pageConfig.title}</title>
        <meta
          name="og:title"
          content={"Mechanisim Calculator - " + props.pageConfig.title}
        />

        <link
          rel="canonical"
          href={window.location.origin + withBasePath(props.pageConfig.url)}
        />
        <meta
          property="og:url"
          content={window.location.origin + withBasePath(props.pageConfig.url)}
        />

        {props.pageConfig.image && (
          <meta
            property="og:image"
            content={
              window.location.origin +
              withBasePath(props.pageConfig.image) +
              ".png"
            }
          />
        )}

        <meta
          name="description"
          content={
            "Mechanisim Calculator (for FRC) - " + props.pageConfig.description
          }
        />
        <meta
          name="og:description"
          content={
            "Mechanisim Calculator (for FRC) - " + props.pageConfig.description
          }
        />
      </Helmet>
    );
  } else {
    return (
      <Helmet>
        <title>Mechanisim Calculator - {props.title}</title>
      </Helmet>
    );
  }
}
