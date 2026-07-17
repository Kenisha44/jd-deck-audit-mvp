import { get, writable } from 'svelte/store';

import {
  loadAudits,
  renameAudit,
  duplicateAudit,
  deleteAudit
} from '../lib/database/auditService.js';

import { user } from './authStore.js';

function normalizeAudit(row) {
  const report = row.audit || {};

  return {
    id: row.id,

    title:
      row.title ||
      row.presentation_name ||
      report.deckName ||
      'Untitled Presentation',

    presentationName:
      row.presentation_name ||
      report.deckName ||
      'Untitled Presentation',

    overallScore:
      row.overall_score ??
      report.overall ??
      report.overallScore ??
      0,

    grade:
      row.grade ??
      report.grade ??
      null,

    slideCount:
      report.slideCount ??
      report.slides?.length ??
      0,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at || row.created_at,

    userId:
      row.user_id,

    report,

    raw: row
  };
}

function createAuditStore() {
  const { subscribe, set, update } =
    writable([]);

  const loading = writable(false);
  const error = writable('');

  async function refresh() {
    loading.set(true);
    error.set('');

    try {
      const currentUser = get(user);

      if (!currentUser?.id) {
        set([]);
        return;
      }

      const result =
        await loadAudits(currentUser.id);

      if (!result.success) {
        throw (
          result.error ||
          new Error(
            'Saved audits could not be loaded.'
          )
        );
      }

      const normalizedAudits =
        (result.data || []).map(normalizeAudit);

      set(normalizedAudits);
    } catch (err) {
      console.error(
        'Audit store refresh failed:',
        err
      );

      error.set(
        err?.message ||
        'Saved audits could not be loaded.'
      );

      set([]);
    } finally {
      loading.set(false);
    }
  }

  async function rename(id, title) {
    error.set('');

    const result =
      await renameAudit(id, title);

    if (!result.success) {
      error.set(
        result.error?.message ||
        'The audit could not be renamed.'
      );

      return false;
    }

    update(items =>
      items.map(item =>
        item.id === id
          ? {
              ...item,
              title,
              updatedAt:
                result.data?.updated_at ||
                new Date().toISOString()
            }
          : item
      )
    );

    return true;
  }

  async function duplicate(audit) {
    error.set('');

    const sourceAudit =
      audit.raw || audit;

    const result =
      await duplicateAudit(sourceAudit);

    if (!result.success) {
      error.set(
        result.error?.message ||
        'The audit could not be duplicated.'
      );

      return false;
    }

    await refresh();

    return true;
  }

  async function remove(id) {
    error.set('');

    const result =
      await deleteAudit(id);

    if (!result.success) {
      error.set(
        result.error?.message ||
        'The audit could not be deleted.'
      );

      return false;
    }

    update(items =>
      items.filter(item => item.id !== id)
    );

    return true;
  }

  return {
    subscribe,
    loading,
    error,
    refresh,
    rename,
    duplicate,
    remove
  };
}

export const auditStore =
  createAuditStore();