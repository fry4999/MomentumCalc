import PageConfig from "common/models/PageConfig";
import { lazy } from "react";

const aboutConfig: PageConfig = {
  url: "/about",
  title: "About Mechanisim Calculator",
  description: "About Mechanisim Calculator",
  image: "/media/motor_512",
  version: 1,
  component: lazy(() => import("web/about/About")),
};

export default aboutConfig;
