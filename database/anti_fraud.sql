-- ============================================
-- MERLOT VIP — MIGRAȚIE: PROTECȚIE ANTI-FRAUDĂ LA SCANARE
-- Rulează acest SQL în Supabase SQL Editor (Schema → Public)
-- pentru proiectele deja existente. Idempotent (poate rula de mai multe ori).
--
-- Ce adaugă:
--  1. Coloane financiare pe visits_log (bill_amount, discount_amount, final_amount)
--  2. Funcția scan_nfc_card consolidată, cu:
--     a) Cooldown per card: o singură scanare validă la 2 minute
--     b) Rate limiting per barman: max 10 scanări valide / oră
--     c) Lock `FOR UPDATE` pe card: previne scanările simultane (dubluri)
--     d) Parametru opțional p_bill_amount (calculul notei de la POS se face PE SERVER,
--        nu în browser — barmanul nu poate manipula reducerea din client)
--
-- Valorile sunt sincronizate cu src/lib/supabase.ts:
--   SCAN_COOLDOWN_MS = 2 * 60 * 1000 (2 minute)
--   BARMAN_MAX_SCANS_PER_HOUR = 10
-- ============================================

-- 1. Coloane financiare (idempotent)
ALTER TABLE visits_log ADD COLUMN IF NOT EXISTS bill_amount NUMERIC(10,2);
ALTER TABLE visits_log ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2);
ALTER TABLE visits_log ADD COLUMN IF NOT EXISTS final_amount NUMERIC(10,2);

-- 2. Index pentru verificările rapide de cooldown/rate-limit
CREATE INDEX IF NOT EXISTS idx_visits_card_scanned ON visits_log(card_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_barman_scanned ON visits_log(barman_id, scanned_at DESC);

-- 3. Funcția de scanare consolidată (anti-fraud + POS + badge-uri)
--    Notă: dacă ai instalat badge-urile prin install_badges.sql, funcția
--    award_badges_for_visit există deja; altfel comentează linia PERFORM.
CREATE OR REPLACE FUNCTION public.scan_nfc_card(
  p_card_uuid VARCHAR(36),
  p_barman_id UUID,
  p_bill_amount NUMERIC DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_card RECORD;
  v_client RECORD;
  v_discount INTEGER := 0;
  v_rule_name TEXT := 'Fără reducere';
  v_now TIME := CURRENT_TIME;
  v_day INTEGER := EXTRACT(DOW FROM NOW());
  v_rule RECORD;
  v_total_visits INTEGER;
  v_last_scan TIMESTAMPTZ;
  v_barman_scans_hour INTEGER;
  v_discount_amount NUMERIC;
  v_final_amount NUMERIC;
BEGIN
  -- 1. Gaseste cardul
  SELECT * INTO v_card FROM nfc_cards WHERE card_uuid = p_card_uuid;

  IF v_card IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Card NFC necunoscut');
  END IF;

  IF v_card.status = 'blocked' THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Card BLOCAT! Contactati managerul.');
  END IF;

  IF v_card.assigned_user_id IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Card neasociat unui client.');
  END IF;

  -- ============================================
  -- PROTECTIE ANTI-FRAUDA (sincronizata cu src/lib/supabase.ts:
  -- SCAN_COOLDOWN_MS = 2 minute, BARMAN_MAX_SCANS_PER_HOUR = 10)
  -- ============================================

  -- a) Cooldown per card: o singura scanare valida / 2 minute
  SELECT MAX(scanned_at) INTO v_last_scan
  FROM visits_log
  WHERE card_id = v_card.id
  AND scanned_at > NOW() - INTERVAL '2 minutes';

  IF v_last_scan IS NOT NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Card scanat recent! Asteptati 2 minute intre scanari (anti-fraud).'
    );
  END IF;

  -- b) Rate limiting per barman: max 10 scanari valide / ora
  SELECT COUNT(*) INTO v_barman_scans_hour
  FROM visits_log
  WHERE barman_id = p_barman_id
  AND scanned_at > NOW() - INTERVAL '1 hour';

  IF v_barman_scans_hour >= 10 THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Limita atinsa: maxim 10 scanari/ora pentru acest barman.'
    );
  END IF;

  -- Lock pe randul cardului: previne scanarile simultane (dubluri prin paralelism)
  PERFORM 1 FROM nfc_cards WHERE id = v_card.id FOR UPDATE;

  -- 2. Gaseste clientul
  SELECT * INTO v_client FROM users WHERE id = v_card.assigned_user_id;

  -- 3. Calculeaza cel mai bun discount activ
  FOR v_rule IN
    SELECT * FROM discount_rules
    WHERE is_active = TRUE
    AND v_day = ANY(valid_days)
  LOOP
    -- Verifica interval orar (inclusiv overnight)
    IF (v_now >= v_rule.start_time AND v_now <= v_rule.end_time)
       OR (v_rule.end_time < v_rule.start_time AND (v_now >= v_rule.start_time OR v_now <= v_rule.end_time))
    THEN
      IF v_rule.discount_percentage > v_discount THEN
        v_discount := v_rule.discount_percentage;
        v_rule_name := v_rule.name;
      END IF;
    END IF;
  END LOOP;

  -- 4. Calcule financiare (daca s-a trimis nota de plata de la POS)
  IF p_bill_amount IS NOT NULL AND p_bill_amount > 0 THEN
    v_discount_amount := ROUND(p_bill_amount * v_discount / 100.0, 2);
    v_final_amount := ROUND((p_bill_amount - v_discount_amount)::NUMERIC, 2);
  END IF;

  -- 5. Inregistreaza vizita (cu detaliile financiare daca exista)
  INSERT INTO visits_log (card_id, client_id, barman_id, discount_applied, bill_amount, discount_amount, final_amount)
  VALUES (v_card.id, v_client.id, p_barman_id, v_discount, p_bill_amount, v_discount_amount, v_final_amount);

  -- 6. Numara vizitele totale
  SELECT COUNT(*) INTO v_total_visits FROM visits_log WHERE client_id = v_client.id;

  -- 7. Acorda badge-uri automat
  PERFORM award_badges_for_visit(v_client.id);

  -- 8. Returneaza rezultat
  RETURN jsonb_build_object(
    'valid', true,
    'discount_percentage', v_discount,
    'discount', CASE WHEN v_discount > 0 THEN v_discount || '%' ELSE '0%' END,
    'client_id', v_client.id,
    'client_name', v_client.name,
    'client_phone', v_client.phone,
    'client_avatar', v_client.avatar,
    'card_uuid', v_card.card_uuid,
    'total_visits', v_total_visits,
    'rule_name', v_rule_name,
    'bill_amount', p_bill_amount,
    'discount_amount', v_discount_amount,
    'final_amount', v_final_amount,
    'message', CASE
      WHEN v_discount > 0 AND v_final_amount IS NOT NULL
        THEN 'Reducere ' || v_discount || '% aplicata! Total: ' || v_final_amount || ' RON (Economie: ' || v_discount_amount || ' RON)'
      WHEN v_discount > 0 THEN 'Reducere ' || v_discount || '% aplicata! (' || v_rule_name || ')'
      WHEN v_final_amount IS NOT NULL THEN 'Vizita inregistrata. Total de plata: ' || v_final_amount || ' RON'
      ELSE 'Vizita inregistrata (fara reducere activa)'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Reprovisionează funcția pentru rolurile anon/authenticated (rpc)
GRANT EXECUTE ON FUNCTION public.scan_nfc_card(VARCHAR, UUID, NUMERIC) TO anon, authenticated;
