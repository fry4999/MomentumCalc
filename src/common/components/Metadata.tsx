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
        <title>MoCalc - {props.pageConfig.title}</title>
        <meta name="og:title" content={"MoCalc - " + props.pageConfig.title} />

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
          content={"MoCalc (for FRC) - " + props.pageConfig.description}
        />
        <meta
          name="og:description"
          content={"MoCalc (for FRC) - " + props.pageConfig.description}
        />
      </Helmet>
    );
  } else {
    return (
      <Helmet>
        <title>
          {props.title === undefined ? "MoCalc" : `MoCalc - ${props.title}`}
        </title>
      </Helmet>
    );
  }
}
