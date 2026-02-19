// src/utils/constants.ts

// COMPLETE APPWRITE CONFIGURATION - SwimWaveUp ✅✅✅
export const APPWRITE_CONFIG = {
  endpoint: 'https://cloud.appwrite.io/v1',
  projectId: '689f3f50002084e457b3',          // ✅ SwimWaveUp Project ID
  
  // Database
  databaseId: '689f3f72000bdfbf207d',          // ✅ swimwaveup-db
  
  // Collections IDs - ✅ ALL COMPLETE!
  collections: {
    users: '689f415600092ab09731',            // ✅ users collection
    structures: '689f730b0037afc4d7b3',       // ✅ structures collection
    posts: '689f46b3001ca55e205a',            // ✅ posts collection  
    jobs: '689f48710018c63bf2f0',             // ✅ jobs collection
    applications: '689f4a880018d51d47c3',     // ✅ applications collection
    connections: '689f4daf0030b12d710f',      // ✅ connections collection
    messages: '689f4ff60003f54ffed9',         // ✅ messages collection
    likes: '689f5182003319060df9',            // ✅ likes collection
    comments: '689f51bb002e902eac09',          // ✅ comments collection
  },
  
  // Storage Buckets IDs - ✅ ALL CREATED
  buckets: {
    avatars: '689f3fba003652809a73',          // ✅ avatars bucket
    posts: '689f40ad001e78f1ee20',            // ✅ posts bucket  
    documents: '689f40d8002f4dc89cc0',        // ✅ documents bucket
    logos: '689f40f200381defc666'             // ✅ logos bucket
  }
};

// SwimWaveUp application constants
export const USER_TYPES = {
  PROFESSIONAL: 'professional',
  STRUCTURE: 'structure'
};

export const POST_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  JOB: 'job_offer'
};

// Updated FIN qualifications for SwimWaveUp
export const QUALIFICATIONS = {
  // Teaching
  ISTRUTTORE_BASE: 'istruttore_nuoto_base',
  AIUTO_ALLENATORE: 'aiuto_allenatore',
  
  // Discipline Coaches
  ALLENATORE_NUOTO: 'allenatore_nuoto',
  ALLENATORE_PALLANUOTO: 'allenatore_pallanuoto',
  ALLENATORE_SINCRO: 'allenatore_sincronizzato',
  ALLENATORE_FONDO: 'allenatore_nuoto_fondo',
  ALLENATORE_PINNATO: 'allenatore_nuoto_pinnato',
  ALLENATORE_TUFFI: 'allenatore_tuffi',
  ALLENATORE_MASTERS: 'allenatore_masters',
  
  // Head Coaches
  CAPO_ALLENATORE_NUOTO: 'capo_allenatore_nuoto',
  CAPO_ALLENATORE_PALLANUOTO: 'capo_allenatore_pallanuoto',
  CAPO_ALLENATORE_SINCRO: 'capo_allenatore_sincro',
  
  // Lifeguards
  ASSISTENTE_BAGNANTE_FERME: 'assistente_bagnante_acque_ferme',
  ASSISTENTE_BAGNANTE_LIBERE: 'assistente_bagnante_acque_libere',
  ASSISTENTE_BAGNANTE_MISTE: 'assistente_bagnante_miste',
  ASSISTENTE_BAGNANTE_PLUS: 'assistente_bagnante_plus',
  
  // Management
  COORDINATORE_PISCINA: 'coordinatore_piscina',
  DIRETTORE_TECNICO: 'direttore_tecnico',
  MANUTENTORE_BASE: 'manutentore_piscine_base',
  MANUTENTORE_AVANZATO: 'manutentore_piscine_avanzato',
  MANUTENTORE_SPECIALISTA: 'manutentore_piscine_specialista'
};

export const SPECIALIZATIONS = {
  IDROKINESITERAPIA: 'idrokinesiterapia',
  ACQUATICITA_NEONATALE: 'acquaticita_neonatale',
  NUOTO_DISABILI: 'nuoto_per_disabili',
  ACQUA_FITNESS: 'acqua_fitness_aerobica',
  RIABILITAZIONE: 'riabilitazione_post_trauma'
};