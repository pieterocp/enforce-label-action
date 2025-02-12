"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
exports.enforceAnyLabels = enforceAnyLabels;
exports.enforceAllLabels = enforceAllLabels;
exports.enforceBannedLabels = enforceBannedLabels;
exports.getInputArray = getInputArray;
exports.getInputString = getInputString;
const core_1 = require("@actions/core");
function enforceAnyLabels(labels) {
    const requiredLabelsAny = getInputArray("REQUIRED_LABELS_ANY");
    console.log(requiredLabelsAny);
    if (requiredLabelsAny.length > 0 &&
        !requiredLabelsAny.some((requiredLabel) => labels.find((l) => l.name === requiredLabel))) {
        const requiredLabelsAnyDescription = getInputString("REQUIRED_LABELS_ANY_DESCRIPTION", `Please select one of the required labels for this PR: ${requiredLabelsAny}`);
        (0, core_1.setFailed)(requiredLabelsAnyDescription);
    }
}
function enforceAllLabels(labels) {
    const requiredLabelsAll = getInputArray("REQUIRED_LABELS_ALL");
    console.log(requiredLabelsAll);
    if (!requiredLabelsAll.every((requiredLabel) => labels.find((l) => l.name === requiredLabel))) {
        const requiredLabelsAllDescription = getInputString("REQUIRED_LABELS_ALL_DESCRIPTION", `All labels are required for this PR: ${requiredLabelsAll}`);
        (0, core_1.setFailed)(requiredLabelsAllDescription);
    }
}
function enforceBannedLabels(labels) {
    const bannedLabels = getInputArray("BANNED_LABELS");
    console.log(bannedLabels);
    let bannedLabel;
    if (bannedLabels &&
        (bannedLabel = labels.find((l) => bannedLabels.includes(l.name)))) {
        const bannedLabelsDescription = getInputString("BANNED_LABELS_DESCRIPTION", `${bannedLabel.name} label is banned`);
        (0, core_1.setFailed)(bannedLabelsDescription);
    }
}
function getInputArray(name) {
    const rawInput = (0, core_1.getInput)(name, { required: false });
    console.log(rawInput);
    return rawInput !== "" ? rawInput.split(",") : [];
}
function getInputString(name, defaultValue) {
    const rawInput = (0, core_1.getInput)(name, { required: false });
    console.log(rawInput);
    return rawInput !== "" ? rawInput : defaultValue;
}
const run = (context) => {
    var _a, _b;
    const { eventName } = context;
    (0, core_1.info)(`Event name: ${eventName}`);
    if (eventName !== "pull_request") {
        (0, core_1.setFailed)(`Invalid event: ${eventName}, it should be use on pull_request`);
        return;
    }
    const labels = (_b = (_a = context === null || context === void 0 ? void 0 : context.payload) === null || _a === void 0 ? void 0 : _a.pull_request) === null || _b === void 0 ? void 0 : _b.labels;
    (0, core_1.info)(`Pull Request labels: "${labels}"`);
    enforceAnyLabels(labels);
    enforceAllLabels(labels);
    enforceBannedLabels(labels);
};
exports.run = run;
