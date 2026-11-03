import { validateArtifact, type PolicyArtifact } from '../../domain';
import active from './active.json';

/** The promoted policy artifact (`infrastructure/policy/active.json`, written by the promotion command), or undefined while none is promoted. Invalid files are ignored. */
export function loadActivePolicy(): PolicyArtifact | undefined {
  return validateArtifact(active) ? active : undefined;
}
