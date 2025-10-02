// Teste simples para verificar o serviço F1
import { f1Service } from '../src/services/f1.ts';

async function testF1Service() {
  console.log('🏎️  Testando serviço F1...');
  
  try {
    // Testar busca de pilotos atuais
    console.log('\n📋 Buscando pilotos atuais de 2025...');
    const drivers = await f1Service.getCurrentDrivers();
    console.log(`✅ Encontrados ${drivers.length} pilotos:`);
    
    drivers.slice(0, 5).forEach(driver => {
      console.log(`   ${driver.givenName} ${driver.familyName} (#${driver.permanentNumber})`);
    });
    
    // Testar prompt dos pilotos
    console.log('\n📝 Testando prompt dos pilotos...');
    const prompt = await f1Service.getCurrentDriversPrompt();
    console.log('✅ Prompt gerado com sucesso!');
    console.log(prompt.substring(0, 200) + '...');
    
    // Testar validação de piloto
    console.log('\n🔍 Testando validação de pilotos...');
    const maxValid = await f1Service.isCurrentDriver('Max Verstappen');
    const lewisValid = await f1Service.isCurrentDriver('Lewis Hamilton');
    const perezValid = await f1Service.isCurrentDriver('Sergio Pérez'); // Não deveria estar em 2025
    
    console.log(`   Max Verstappen: ${maxValid ? '✅ Válido' : '❌ Inválido'}`);
    console.log(`   Lewis Hamilton: ${lewisValid ? '✅ Válido' : '❌ Inválido'}`);
    console.log(`   Sergio Pérez: ${perezValid ? '✅ Válido' : '❌ Inválido'}`);
    
    // Testar equipes
    console.log('\n🏁 Buscando equipes atuais...');
    const teams = await f1Service.getCurrentTeams();
    console.log(`✅ Encontradas ${teams.length} equipes:`);
    teams.slice(0, 3).forEach(team => {
      console.log(`   ${team}`);
    });
    
    console.log('\n🎉 Todos os testes passaram!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testF1Service();
}