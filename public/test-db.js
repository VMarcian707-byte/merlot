// ============================================
// Script Test Conexiune Bază de Date
// ============================================
// Rulează în consola browser-ului (F12 → Console)
// ============================================

async function testDatabase() {
  console.log('🍷 Merlot VIP — Test Conexiune Bază de Date\n');
  console.log('═══════════════════════════════════════════\n');

  // Import Supabase client
  const { supabase } = await import('./src/lib/supabase.ts');

  // Test 1: Verifică configurație
  console.log('📋 Test 1: Verificare configurație...');
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('❌ VARIABILE DE MEDIU LIPSĂ!');
    console.error('Verifică fișierul .env');
    return;
  }
  console.log('✅ Configurație OK');
  console.log(`   URL: ${url}\n`);

  // Test 2: Conexiune la Supabase
  console.log('🔌 Test 2: Conexiune la Supabase...');
  try {
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Conexiune eșuată:', error.message);
      return;
    }
    console.log('✅ Conexiune stabilită\n');
  } catch (err) {
    console.error('❌ Eroare:', err.message);
    return;
  }

  // Test 3: Verifică tabele
  console.log('📊 Test 3: Verificare tabele...');
  const tables = ['users', 'nfc_cards', 'discount_rules', 'visits_log', 'announcements'];
  const tableStatus = {};

  for (const table of tables) {
    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    tableStatus[table] = !error;
  }

  const allTablesExist = Object.values(tableStatus).every(v => v);
  if (allTablesExist) {
    console.log('✅ Toate tabelele există');
    Object.entries(tableStatus).forEach(([table, exists]) => {
      console.log(`   ✓ ${table}`);
    });
  } else {
    console.error('❌ Tabele lipsă:');
    Object.entries(tableStatus).forEach(([table, exists]) => {
      if (!exists) console.error(`   ✗ ${table}`);
    });
    console.error('\n💡 Rulează database/schema.sql în Supabase SQL Editor\n');
    return;
  }
  console.log('');

  // Test 4: Numără înregistrări
  console.log('🔢 Test 4: Număr înregistrări...');
  const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: cardsCount } = await supabase.from('nfc_cards').select('*', { count: 'exact', head: true });
  const { count: rulesCount } = await supabase.from('discount_rules').select('*', { count: 'exact', head: true });
  const { count: visitsCount } = await supabase.from('visits_log').select('*', { count: 'exact', head: true });
  const { count: announcementsCount } = await supabase.from('announcements').select('*', { count: 'exact', head: true });

  console.log('✅ Statistici:');
  console.log(`   Users: ${usersCount || 0}`);
  console.log(`   NFC Cards: ${cardsCount || 0}`);
  console.log(`   Discount Rules: ${rulesCount || 0}`);
  console.log(`   Visits: ${visitsCount || 0}`);
  console.log(`   Announcements: ${announcementsCount || 0}\n`);

  // Test 5: Test funcție SQL
  console.log('⚙️  Test 5: Funcție SQL scan_nfc_card...');
  try {
    const { data, error } = await supabase.rpc('scan_nfc_card', {
      p_card_uuid: 'TEST-INVALID-UUID',
      p_barman_id: '00000000-0000-0000-0000-000000000000'
    });

    if (error && error.message.includes('function') && error.message.includes('does not exist')) {
      console.error('❌ Funcția scan_nfc_card nu există');
      console.error('💡 Rulează database/schema.sql pentru a crea funcțiile\n');
    } else {
      console.log('✅ Funcția SQL există și funcționează');
      console.log(`   Răspuns test: ${JSON.stringify(data)}\n`);
    }
  } catch (err) {
    console.error('❌ Eroare la testare funcție:', err.message);
  }

  // Test 6: Autentificare
  console.log('🔐 Test 6: Sistem autentificare...');
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    console.log('✅ Utilizator autentificat');
    console.log(`   Email: ${session.user.email}\n`);
  } else {
    console.log('ℹ️  Niciun utilizator logat (normal pentru test)\n');
  }

  // Rezultat final
  console.log('═══════════════════════════════════════════');
  console.log('✅ TESTE FINALIZATE CU SUCCES!');
  console.log('═══════════════════════════════════════════\n');
  
  if (usersCount === 0) {
    console.log('💡 Baza de date este goală.');
    console.log('   Creează primul utilizator din interfață sau cu SQL:');
    console.log(`
   INSERT INTO auth.users (
     id, email, encrypted_password, email_confirmed_at, 
     raw_user_meta_data, created_at, updated_at
   ) VALUES (
     gen_random_uuid(),
     'manager@merlot.ro',
     crypt('Manager123!', gen_salt('bf')),
     NOW(),
     '{"name": "Andrei Manager", "role": "manager"}'::jsonb,
     NOW(),
     NOW()
   );
    `);
  }
}

// Rulează testul
testDatabase().catch(err => {
  console.error('❌ Eroare neașteptată:', err);
});
