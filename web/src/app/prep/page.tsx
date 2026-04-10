import { PrepFlow, EventType } from "./prep-flow";

function isEventType(value: string | string[] | undefined): value is EventType {
  return (
    value === "social" ||
    value === "work" ||
    value === "learning" ||
    value === "casual"
  );
}

function getInitialStep(
  stepParam: string | string[] | undefined,
  hasEventType: boolean
) {
  const value = Array.isArray(stepParam) ? stepParam[0] : stepParam;
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0 || !hasEventType) {
    return 0;
  }

  return Math.min(parsed, 3);
}

export default async function PrepPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string | string[]; eventType?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const eventTypeParam = Array.isArray(resolvedSearchParams.eventType)
    ? resolvedSearchParams.eventType[0]
    : resolvedSearchParams.eventType;
  const initialEventType = isEventType(eventTypeParam) ? eventTypeParam : null;
  const initialStep = getInitialStep(
    resolvedSearchParams.step,
    initialEventType !== null
  );

  return (
    <PrepFlow
      initialStep={initialStep}
      initialEventType={initialEventType}
    />
  );
}
