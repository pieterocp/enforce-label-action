/* eslint-disable @typescript-eslint/no-var-requires */
import * as core from "@actions/core";
import { run, enforceAllLabels, enforceAnyLabels, enforceBannedLabels } from "../run";
import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import {Context} from "@actions/github/lib/context";


jest.mock('@actions/core');
const { setFailed, getInput } = core as unknown as {
  setFailed: jest.MockedFunction<typeof core.setFailed>,
  getInput: jest.MockedFunction<typeof core.getInput>
};

function mockGetInput(mapping: Record<string, string>) {
  getInput.mockImplementation((name: string) => mapping[name] ?? '');
}

type Label = { name: string };
const label = (name: string): Label => ({ name });

describe('Label Enforcer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('enforceAnyLabels', () => {
    it('does nothing if REQUIRED_LABELS_ANY is empty', () => {
      mockGetInput({ 'REQUIRED_LABELS_ANY': '' });
      enforceAnyLabels([label('foo')]);
      expect(setFailed).not.toHaveBeenCalled();
    });

    it('does nothing if at least one required label is present', () => {
      mockGetInput({ 'REQUIRED_LABELS_ANY': 'bug,feature' });
      enforceAnyLabels([label('feature')]);
      expect(setFailed).not.toHaveBeenCalled();
    });

    it('calls setFailed if none of the required labels are present', () => {
      mockGetInput({
        'REQUIRED_LABELS_ANY': 'bug,feature',
        'REQUIRED_LABELS_ANY_DESCRIPTION': 'Custom any label message'
      });
      enforceAnyLabels([label('help')]);
      expect(setFailed).toHaveBeenCalledWith('Custom any label message');
    });

    it('uses default description if none provided', () => {
      mockGetInput({ 'REQUIRED_LABELS_ANY': 'bug,feature' });
      enforceAnyLabels([label('help')]);
      expect(setFailed).toHaveBeenCalledWith(
          expect.stringContaining('Please select one of the required labels')
      );
    });
  });

  describe('enforceAllLabels', () => {

    it('does nothing if all required labels are present', () => {
      mockGetInput({ 'REQUIRED_LABELS_ALL': 'bug,feature' });
      enforceAllLabels([label('bug'), label('feature')]);
      expect(setFailed).not.toHaveBeenCalled();
    });

    it('calls setFailed if a required label is missing', () => {
      mockGetInput({
        'REQUIRED_LABELS_ALL': 'bug,feature',
        'REQUIRED_LABELS_ALL_DESCRIPTION': 'Custom all label message'
      });
      enforceAllLabels([label('bug')]);
      expect(setFailed).toHaveBeenCalledWith('Custom all label message');
    });

    it('uses default description if none provided', () => {
      mockGetInput({ 'REQUIRED_LABELS_ALL': 'bug,feature' });
      enforceAllLabels([label('bug')]);
      expect(setFailed).toHaveBeenCalledWith(
          expect.stringContaining('All labels are required')
      );
    });
  });

  describe('enforceBannedLabels', () => {
    it('does nothing if no banned labels', () => {
      mockGetInput({ 'BANNED_LABELS': '' });
      enforceBannedLabels([label('safe')]);
      expect(setFailed).not.toHaveBeenCalled();
    });

    it('does nothing if no banned label present', () => {
      mockGetInput({ 'BANNED_LABELS': 'wip,do-not-merge' });
      enforceBannedLabels([label('feature')]);
      expect(setFailed).not.toHaveBeenCalled();
    });

    it('calls setFailed if a banned label is present', () => {
      mockGetInput({
        'BANNED_LABELS': 'wip,do-not-merge',
        'BANNED_LABELS_DESCRIPTION': 'Custom banned label message'
      });
      enforceBannedLabels([label('wip')]);
      expect(setFailed).toHaveBeenCalledWith('Custom banned label message');
    });

    it('uses default description if none provided', () => {
      mockGetInput({ 'BANNED_LABELS': 'wip' });
      enforceBannedLabels([label('wip')]);
      expect(setFailed).toHaveBeenCalledWith(
          expect.stringContaining('wip label is banned')
      );
    });
  });

  describe('run', () => {
    it('fails if not pull_request event', () => {
      run({ eventName: 'push', payload: {} } as unknown as Context);
      expect(setFailed).toHaveBeenCalledWith(
          expect.stringContaining('Invalid event')
      );
    });

    it('calls enforcement functions for pull_request', () => {
      // Just check no error thrown and setFailed not called if all checks pass
      mockGetInput({
        'REQUIRED_LABELS_ANY': '',
        'REQUIRED_LABELS_ALL': '',
        'BANNED_LABELS': ''
      });
      run({
        eventName: 'pull_request',
        payload: {
          pull_request: { labels: [label('foo')] }
        }
      } as unknown as Context);
      expect(setFailed).not.toHaveBeenCalled();
    });
  });
});
