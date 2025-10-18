-- Enforce document format for active commercial entities only
-- Existing rows are not validated immediately (NOT VALID). New inserts/updates must comply.

ALTER TABLE "commercial_entities"
  ADD CONSTRAINT "chk_active_doc_format"
  CHECK (
    (NOT "isActive") OR (
      ("tipoDocumento" = 'DNI' AND "numeroDocumento" ~ '^[0-9]{8}$') OR
      ("tipoDocumento" = 'CE'  AND "numeroDocumento" ~ '^[0-9]{12}$') OR
      ("tipoDocumento" = 'RUC' AND "numeroDocumento" ~ '^[0-9]{11}$')
    )
  ) NOT VALID;

-- After cleanup, you can validate the constraint:
-- ALTER TABLE "commercial_entities" VALIDATE CONSTRAINT "chk_active_doc_format";