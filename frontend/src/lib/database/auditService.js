import { supabase } from '../supabase.js';

export async function saveAudit({
  userId,
  title,
  presentationName,
  audit
}) {
  if (!userId) {
    return {
      success: false,
      error: new Error('You must be signed in to save an audit.')
    };
  }

  const payload = {
    user_id: userId,
    title:
      title ||
      presentationName ||
      audit?.deckName ||
      'Untitled Audit',
    presentation_name:
      presentationName ||
      audit?.deckName ||
      'Untitled Presentation',
    overall_score:
      audit?.overall ?? null,
    grade:
      audit?.grade ?? null,
    audit
  };

  const { data, error } = await supabase
    .from('audits')
    .insert(payload)
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error
    };
  }

  return {
    success: true,
    data
  };
}

export async function loadAudits(userId) {
  if (!userId) {
    return {
      success: false,
      error: new Error('No authenticated user was provided.'),
      data: []
    };
  }

  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {
      ascending: false
    });

  if (error) {
    return {
      success: false,
      error,
      data: []
    };
  }

  return {
    success: true,
    data: data || []
  };
}

export async function loadAudit(auditId) {
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('id', auditId)
    .single();

  if (error) {
    return {
      success: false,
      error
    };
  }

  return {
    success: true,
    data
  };
}
export async function renameAudit(auditId, title) {

    const { data, error } =
      await supabase
        .from('audits')
        .update({
          title,
          updated_at: new Date().toISOString()
        })
        .eq('id', auditId)
        .select()
        .single();
  
    if (error) {
      return {
        success: false,
        error
      };
    }
  
    return {
      success: true,
      data
    };
  
  }
  export async function deleteAudit(auditId) {

    const { error } =
      await supabase
        .from('audits')
        .delete()
        .eq('id', auditId);
  
    if (error) {
  
      return {
        success: false,
        error
      };
  
    }
  
    return {
      success: true
    };
  
  }
  export async function duplicateAudit(audit) {

    const copy = {
      ...audit,
      id: undefined,
      created_at: undefined,
      updated_at: undefined,
      title: `${audit.title} Copy`
    };
  
    return saveAudit({
  
      userId: audit.user_id,
  
      title: copy.title,
  
      presentationName:
        audit.presentation_name,
  
      audit: audit.audit
  
    });
  
  }