import type { MetaFunction } from "@remix-run/node";
import SceneCanvas from "~/components/scene-canvas";

export const meta: MetaFunction = () => {
  return [
    { title: "Babylon.js Outline" },
    {
      name: "description",
      content: "A demo showcasing mesh picking with an outline.",
    },
  ];
};

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center">
      <SceneCanvas />
    </div>
  );
}
