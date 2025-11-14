-- ============================================================
--  AI_DOC_MANAGER  -  Schema SQL (MySQL 8+ compatible)
--  Version : FAISS externe (pas de type VECTOR)
-- ============================================================

CREATE DATABASE IF NOT EXISTS ai_doc_manager
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ai_doc_manager;

-- ============================================================
-- 1️⃣ USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS USERS (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2️⃣ DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS DOCUMENTS (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  doc_type ENUM('txt','pdf','docx','md') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_docs_user FOREIGN KEY (user_id)
    REFERENCES USERS(id)
    ON DELETE CASCADE
);

-- ============================================================
-- 3️⃣ DOCUMENT_CHUNKS
-- ============================================================
CREATE TABLE IF NOT EXISTS DOCUMENT_CHUNKS (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  document_id BIGINT NOT NULL,
  chunk_index INT NOT NULL,
  content MEDIUMTEXT NOT NULL,
  start_offset INT NULL,
  end_offset INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chunks_doc FOREIGN KEY (document_id)
    REFERENCES DOCUMENTS(id)
    ON DELETE CASCADE,
  KEY idx_doc_chunk (document_id, chunk_index)
);
-- ============================================================
-- 4️⃣ FAISS_MAP (AJOUT IMPORTANT)
-- Relation entre l'index FAISS et le chunk MySQL
-- ============================================================
CREATE TABLE IF NOT EXISTS FAISS_MAP (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  -- Ceci est l'ID interne de FAISS (la position du vecteur dans l'index)
  faiss_index_id BIGINT NOT NULL,
  -- Ceci est l'ID du chunk dans notre table DOCUMENT_CHUNKS
  chunk_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_map_user FOREIGN KEY (user_id)
    REFERENCES USERS(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_map_chunk FOREIGN KEY (chunk_id)
    REFERENCES DOCUMENT_CHUNKS(id)
    ON DELETE CASCADE,
  -- Un index FAISS est par utilisateur
  UNIQUE KEY uq_user_faiss_id (user_id, faiss_index_id),
  KEY idx_map_chunk (chunk_id)
);
-- ============================================================
-- 5️⃣ TAGS
-- ============================================================
CREATE TABLE IF NOT EXISTS TAGS (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tag_user_name (user_id, name),
  CONSTRAINT fk_tags_user FOREIGN KEY (user_id)
    REFERENCES USERS(id)
    ON DELETE CASCADE
);

-- ============================================================
-- 6️⃣ DOCUMENT_TAGS (relation n-n entre DOCUMENTS et TAGS)
-- ============================================================
CREATE TABLE IF NOT EXISTS DOCUMENT_TAGS (
  document_id BIGINT NOT NULL,
  tag_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (document_id, tag_id),
  CONSTRAINT fk_dt_doc FOREIGN KEY (document_id)
    REFERENCES DOCUMENTS(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_dt_tag FOREIGN KEY (tag_id)
    REFERENCES TAGS(id)
    ON DELETE CASCADE
);

-- ============================================================
-- 7️⃣ DOCUMENT_METADATA (clé/valeur flexible)
-- ============================================================
CREATE TABLE IF NOT EXISTS DOCUMENT_METADATA (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  document_id BIGINT NOT NULL,
  meta_key VARCHAR(255) NOT NULL,
  meta_value TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_meta_doc (document_id, meta_key),
  CONSTRAINT fk_meta_doc FOREIGN KEY (document_id)
    REFERENCES DOCUMENTS(id)
    ON DELETE CASCADE
);

-- ============================================================
-- 8️⃣ SEARCHES (historique des recherches)
-- ============================================================
CREATE TABLE IF NOT EXISTS SEARCHES (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  query_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_search_user FOREIGN KEY (user_id)
    REFERENCES USERS(id)
    ON DELETE CASCADE
);

-- ============================================================
-- 9️⃣ SEARCH_RESULTS (résultats des recherches)
-- ============================================================
CREATE TABLE IF NOT EXISTS SEARCH_RESULTS (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  search_id BIGINT NOT NULL,
  chunk_id BIGINT NOT NULL,
  score DOUBLE NOT NULL,
  rank_pos INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sr_search FOREIGN KEY (search_id)
    REFERENCES SEARCHES(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_sr_chunk FOREIGN KEY (chunk_id)
    REFERENCES DOCUMENT_CHUNKS(id)
    ON DELETE CASCADE
);

-- ============================================================
-- ✅ Index et contraintes additionnelles
-- ============================================================

-- Pour accélérer les jointures FAISS → CHUNKS
CREATE INDEX idx_faiss_chunk_id ON FAISS_MAP(chunk_id);

-- Pour faciliter les recherches de documents par utilisateur
CREATE INDEX idx_doc_user_id ON DOCUMENTS(user_id);

-- Pour accélérer les requêtes sur les métadonnées
CREATE INDEX idx_meta_key ON DOCUMENT_METADATA(meta_key);

-- Pour faciliter l'historique de recherche
CREATE INDEX idx_search_user ON SEARCHES(user_id);
