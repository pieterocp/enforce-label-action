import { info, setFailed, getInput } from "@actions/core";
import { Context } from "@actions/github/lib/context";

export function enforceAnyLabels(labels) {
  const requiredLabelsAny = getInputArray("REQUIRED_LABELS_ANY");
  console.log(requiredLabelsAny);
  if (
    requiredLabelsAny.length > 0 &&
    !requiredLabelsAny.some((requiredLabel) =>
      labels.find((l) => l.name === requiredLabel)
    )
  ) {
    const requiredLabelsAnyDescription = getInputString(
      "REQUIRED_LABELS_ANY_DESCRIPTION",
      `Please select one of the required labels for this PR: ${requiredLabelsAny}`
    );
    setFailed(requiredLabelsAnyDescription);
  }
}

export function enforceAllLabels(labels) {
  const requiredLabelsAll = getInputArray("REQUIRED_LABELS_ALL");
  console.log(requiredLabelsAll);
  if (
    !requiredLabelsAll.every((requiredLabel) =>
      labels.find((l) => l.name === requiredLabel)
    )
  ) {
    const requiredLabelsAllDescription = getInputString(
      "REQUIRED_LABELS_ALL_DESCRIPTION",
      `All labels are required for this PR: ${requiredLabelsAll}`
    );
    setFailed(requiredLabelsAllDescription);
  }
}

export function enforceBannedLabels(labels) {
  const bannedLabels = getInputArray("BANNED_LABELS");
  console.log(bannedLabels);
  let bannedLabel;
  if (
    bannedLabels &&
    (bannedLabel = labels.find((l) => bannedLabels.includes(l.name)))
  ) {
    const bannedLabelsDescription = getInputString(
      "BANNED_LABELS_DESCRIPTION",
      `${bannedLabel.name} label is banned`
    );
    setFailed(bannedLabelsDescription);
  }
}

export function getInputArray(name: string): string[] {
  const rawInput = getInput(name, { required: false });
  return rawInput !== "" ? rawInput.split(",") : [];
}

export function getInputString(name: string, defaultValue): string {
  const rawInput = getInput(name, { required: false });
  return rawInput !== "" ? rawInput : defaultValue;
}

export const run = (context: Context) => {
  const { eventName } = context;
  info(`Event name: ${eventName}`);

  if (eventName !== "pull_request") {
    setFailed(`Invalid event: ${eventName}, it should be use on pull_request`);
    return;
  }

  const labels = context?.payload?.pull_request?.labels;

  info(`Pull Request labels: "${labels}"`);

  enforceAnyLabels(labels);
  enforceAllLabels(labels);
  enforceBannedLabels(labels);
};
