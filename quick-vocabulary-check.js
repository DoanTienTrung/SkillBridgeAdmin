// Quick Vocabulary Check Script
// Paste this into browser console (F12) to instantly verify vocabulary loading

async function quickVocabularyCheck() {
  console.log('🔍 Quick Vocabulary Check...');
  
  // Step 1: Check Authentication
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    console.error('❌ NO TOKEN - Please login first');
    return false;
  }
  
  if (user.role !== 'STUDENT') {
    console.error('❌ WRONG ROLE - Need STUDENT role, current:', user.role);
    return false;
  }
  
  console.log('✅ Authentication OK');
  
  // Step 2: Quick API Test
  try {
    const response = await fetch('http://localhost:8080/api/vocabulary/my-vocabulary', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      console.error(`❌ API FAILED - Status: ${response.status}`);
      const errorData = await response.json();
      console.error('Error:', errorData);
      return false;
    }
    
    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ API RESPONSE FAILED:', data);
      return false;
    }
    
    console.log('✅ API WORKING');
    console.log(`📊 Vocabulary Count: ${data.data?.length || 0}`);
    
    if (data.data && data.data.length > 0) {
      console.log('📝 Sample Vocabulary:', data.data[0]);
    } else {
      console.log('📝 No vocabulary items found (this is normal for new users)');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ NETWORK ERROR:', error);
    console.log('💡 Check if backend is running on localhost:8080');
    return false;
  }
}

// Test save functionality
async function testSaveVocabulary() {
  console.log('🧪 Testing Save Vocabulary...');
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ No authentication token');
    return;
  }
  
  const testWord = {
    word: `test-quick-${Date.now()}`,
    meaning: 'Quick test word',
    phonetic: '/test/',
    category: 'Test',
    difficulty: 'EASY',
    partOfSpeech: 'NOUN',
    notes: 'Auto-generated test word'
  };
  
  try {
    // Save test word
    const saveResponse = await fetch('http://localhost:8080/api/vocabulary/save', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testWord)
    });
    
    if (!saveResponse.ok) {
      console.error('❌ Save failed:', saveResponse.status);
      const errorData = await saveResponse.json();
      console.error('Error:', errorData);
      return;
    }
    
    const saveData = await saveResponse.json();
    console.log('✅ Save successful:', saveData);
    
    // Clean up test word
    if (saveData.data?.id) {
      const deleteResponse = await fetch(`http://localhost:8080/api/vocabulary/${saveData.data.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (deleteResponse.ok) {
        console.log('✅ Test word cleaned up');
      }
    }
    
  } catch (error) {
    console.error('❌ Save test failed:', error);
  }
}

// Check page components
function checkPageComponents() {
  console.log('🔍 Checking Page Components...');
  
  // Check if we're on vocabulary page
  const isVocabPage = window.location.hash.includes('/student/vocabulary');
  console.log('On vocabulary page:', isVocabPage);
  
  // Check for key elements
  const statsCards = document.querySelectorAll('[class*="bg-white p-6"]');
  console.log('Stats cards found:', statsCards.length);
  
  const vocabularyList = document.querySelector('[class*="grid"]');
  console.log('Vocabulary list found:', !!vocabularyList);
  
  const addButton = document.querySelector('button:contains("Thêm từ mới")') ||
                   [...document.querySelectorAll('button')].find(btn => 
                     btn.textContent.includes('Thêm từ mới'));
  console.log('Add button found:', !!addButton);
  
  // Check for error messages
  const errorMessages = document.querySelectorAll('[class*="text-red"], [class*="bg-red"]');
  console.log('Error messages:', errorMessages.length);
  
  if (errorMessages.length > 0) {
    errorMessages.forEach((el, i) => {
      console.log(`Error ${i + 1}:`, el.textContent);
    });
  }
  
  // Check loading state
  const loading = document.querySelector('[class*="animate-spin"]');
  console.log('Loading indicator:', !!loading);
  
  return {
    isVocabPage,
    statsCards: statsCards.length,
    vocabularyList: !!vocabularyList,
    addButton: !!addButton,
    errors: errorMessages.length,
    loading: !!loading
  };
}

// Complete check
async function completeVocabularyCheck() {
  console.log('🎯 Complete Vocabulary Check Starting...\n');
  
  const authOK = await quickVocabularyCheck();
  if (!authOK) {
    console.log('\n❌ VOCABULARY CHECK FAILED - Fix authentication/API first');
    return;
  }
  
  console.log('\n🧪 Testing save functionality...');
  await testSaveVocabulary();
  
  console.log('\n🔍 Checking page components...');
  const components = checkPageComponents();
  
  console.log('\n📋 SUMMARY:');
  console.log('✅ Authentication: OK');
  console.log('✅ API Connection: OK');
  console.log('✅ Save Function: Check above');
  console.log(`📊 Components: ${JSON.stringify(components, null, 2)}`);
  
  console.log('\n🎉 VOCABULARY PAGE STATUS:');
  if (authOK && components.vocabularyList) {
    console.log('✅ VOCABULARY PAGE IS WORKING!');
  } else {
    console.log('❌ VOCABULARY PAGE HAS ISSUES - Check components');
  }
  
  console.log('\n💡 TIPS:');
  console.log('- If API works but no data: Add vocabulary from Reading Lessons');
  console.log('- If components missing: Check for JavaScript errors in Console');
  console.log('- If authentication fails: Logout and login again');
}

// Navigation helpers
function goToVocabularyTest() {
  window.location.hash = '#/student/vocabulary-test';
  console.log('🔧 Navigating to vocabulary test page...');
}

function goToVocabularyPage() {
  window.location.hash = '#/student/vocabulary';
  console.log('📚 Navigating to main vocabulary page...');
}

// Make functions global
window.quickVocabularyCheck = quickVocabularyCheck;
window.testSaveVocabulary = testSaveVocabulary;
window.checkPageComponents = checkPageComponents;
window.completeVocabularyCheck = completeVocabularyCheck;
window.goToVocabularyTest = goToVocabularyTest;
window.goToVocabularyPage = goToVocabularyPage;

console.log('🔧 Quick Vocabulary Check Script Loaded!');
console.log('\n📝 Available Commands:');
console.log('- quickVocabularyCheck() - Fast auth & API check');
console.log('- testSaveVocabulary() - Test save functionality');
console.log('- checkPageComponents() - Check UI components');
console.log('- completeVocabularyCheck() - Full comprehensive check');
console.log('- goToVocabularyTest() - Navigate to test page');
console.log('- goToVocabularyPage() - Navigate to main page');

console.log('\n🚀 Quick Start: Run completeVocabularyCheck()');
