import { createFileRoute } from "@tanstack/react-router";
import Advisor from "../components/Advisor";

export const Route = createFileRoute("/")({
  component: IndexComponent,
});

function IndexComponent() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Advisor />
    </div>
  );
}
