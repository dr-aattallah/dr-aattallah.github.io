export class LabState {
  constructor(missionId) {
    this.key = `the-educator:lab:${missionId}:v1`;
  }

  load() {
    try {
      const raw = window.localStorage.getItem(this.key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  save({ stageIndex, results, activeStageIds }) {
    try {
      window.localStorage.setItem(this.key, JSON.stringify({
        version: 1,
        stageIndex,
        activeStageIds,
        results: [...results.entries()]
      }));
    } catch {
      // The Lab remains fully usable when storage is unavailable.
    }
  }

  clear() {
    try {
      window.localStorage.removeItem(this.key);
    } catch {
      // Ignore storage restrictions; mission reset still works in memory.
    }
  }
}
