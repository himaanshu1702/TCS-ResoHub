const db = require('../database');
const IntentParser = require('./intentParser');

class AiEngine {
  static async processQuery(userQuery) {
    const { intent, type } = IntentParser.analyze(userQuery);
    const keywords = this.extractKeywords(userQuery);

    console.log(`🤖 Bot Log | Query: "${userQuery}" | Keywords: [${keywords}]`);

    if (!keywords || keywords.length === 0) {
      return {
        reply: "Hello! 👋 I am ResoBot. I can help you find Training Modules, SOPs, and Corporate Policies. Try asking: 'Show me Java training' or 'Compliance documents'.",
        results: []
      };
    }

    if (intent === 'FETCH_MODULE') {
      return await this.searchModules(keywords);
    } else {
      return await this.searchAssets(keywords, type);
    }
  }

  static extractKeywords(query) {
    if (!query) return [];
    
    // 1. GENERIC WORD FILTER (The "Noise" Filter)
    // Removing these helps the AI focus on the real topic (e.g. "Access Control")
    const stopWords = [
      'i', 'want', 'to', 'show', 'me', 'find', 'the', 'a', 'an', 'for', 
      'is', 'are', 'can', 'you', 'please', 'hi', 'hello', 'hey', 'where', 
      'what', 'get', 'give', 'check', 
      'module', 'modules', 'file', 'files', 'document', 'documents', 
      'training', 'course', 'courses', 'list', 'ppt', 'pdf'
    ];
    
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => !stopWords.includes(word) && word.length > 1);
  }

  static searchModules(keywords) {
    return new Promise((resolve, reject) => {
      if (!keywords || keywords.length === 0) return resolve({ reply: "Please provide a specific topic.", results: [] });

      // STRATEGY 1: Strict Search (AND)
      const conditionsAnd = keywords.map(() => `(title LIKE ? OR description LIKE ?)`).join(' AND ');
      const paramsAnd = [];
      keywords.forEach(k => { paramsAnd.push(`%${k}%`); paramsAnd.push(`%${k}%`); });

      db.all(`SELECT * FROM modules WHERE ${conditionsAnd} LIMIT 5`, paramsAnd, (err, rows) => {
        if (!err && rows.length > 0) {
          return resolve({ 
            reply: `I found ${rows.length} relevant module(s).`, 
            results: rows.map(r => ({ ...r, kind: 'MODULE' })) 
          });
        }

        // STRATEGY 2: Fallback Broad Search (OR)
        console.log("⚠️ Strict search failed, trying broad search...");
        const conditionsOr = keywords.map(() => `(title LIKE ? OR description LIKE ?)`).join(' OR ');
        const paramsOr = [];
        keywords.forEach(k => { paramsOr.push(`%${k}%`); paramsOr.push(`%${k}%`); });

        db.all(`SELECT * FROM modules WHERE ${conditionsOr} LIMIT 5`, paramsOr, (err2, rows2) => {
          if (err2) {
             console.error("❌ SQL Error:", err2.message);
             return resolve({ reply: "Database error.", results: [] });
          }
          resolve({ 
            reply: rows2.length > 0 ? `I found ${rows2.length} module(s) that might be relevant.` : "No modules found matching your topic.", 
            results: rows2.map(r => ({ ...r, kind: 'MODULE' })) 
          });
        });
      });
    });
  }

  static searchAssets(keywords, fileType) {
    return new Promise((resolve, reject) => {
      if (!keywords || keywords.length === 0) return resolve({ reply: "Please provide a specific topic.", results: [] });

      const buildSql = (operator) => {
        let sql = `SELECT assets.*, modules.title as module_title FROM assets JOIN modules ON assets.module_id = modules.id WHERE (`;
        const conditions = keywords.map(() => `(assets.title LIKE ? OR assets.tags LIKE ?)`).join(` ${operator} `);
        sql += conditions + `)`;
        return sql;
      };

      const params = [];
      keywords.forEach(k => { params.push(`%${k}%`); params.push(`%${k}%`); });

      // Try Strict First
      let sql = buildSql('AND');
      if (fileType) { sql += ` AND assets.file_type = '${fileType}'`; }
      sql += ` LIMIT 5`;

      db.all(sql, params, (err, rows) => {
        if (!err && rows.length > 0) {
          return resolve({ 
            reply: `I found ${rows.length} document(s).`, 
            results: rows.map(r => ({ ...r, kind: 'ASSET' })) 
          });
        }

        // Fallback to Broad
        console.log("⚠️ Strict asset search failed, trying broad search...");
        sql = buildSql('OR');
        if (fileType) { sql += ` AND assets.file_type = '${fileType}'`; }
        sql += ` LIMIT 5`;

        db.all(sql, params, (err2, rows2) => {
          resolve({ 
             reply: rows2.length > 0 ? `I found ${rows2.length} document(s) for you.` : "No specific documents found.", 
             results: rows2.map(r => ({ ...r, kind: 'ASSET' })) 
          });
        });
      });
    });
  }
}

module.exports = AiEngine;