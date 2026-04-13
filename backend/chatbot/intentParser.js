class IntentParser {
  static analyze(query) {
    const lowerQuery = query.toLowerCase();

    // 1. Check for "SOP" or "Document" requests
    if (
      lowerQuery.includes('sop') || 
      lowerQuery.includes('document') || 
      lowerQuery.includes('policy') ||
      lowerQuery.includes('pdf') ||
      lowerQuery.includes('file')
    ) {
      return { intent: 'FETCH_ASSET', type: 'PDF' };
    }

    // 2. Check for "Video" or "Recording" requests
    if (
      lowerQuery.includes('video') || 
      lowerQuery.includes('recording') || 
      lowerQuery.includes('watch') ||
      lowerQuery.includes('clip')
    ) {
      return { intent: 'FETCH_ASSET', type: 'VIDEO' };
    }

    // 3. Check for "Module" or "Course" requests
    if (
      lowerQuery.includes('learn') || 
      lowerQuery.includes('course') || 
      lowerQuery.includes('module') ||
      lowerQuery.includes('training') ||
      lowerQuery.includes('class')
    ) {
      return { intent: 'FETCH_MODULE', type: 'MODULE' };
    }

    // Default: General Knowledge Search
    return { intent: 'GENERAL_SEARCH', type: null };
  }
}

module.exports = IntentParser;